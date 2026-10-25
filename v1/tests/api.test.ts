import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('accounts isolate data, persist plans, reject unsafe writes and delete sessions', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'acadia-test-'));
  const server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    env: {
      ...process.env,
      PORT: '3198',
      ACADIA_DB_PATH: join(directory, 'test.sqlite'),
      NODE_ENV: 'test',
      ACADIA_AI_API_KEY: '',
    },
    stdio: 'pipe',
  });
  let serverOutput = '';
  server.stderr.on('data', (data) => {
    serverOutput += data;
  });
  async function request(
    path: string,
    method = 'GET',
    body?: unknown,
    cookie = '',
    extraHeaders: Record<string, string> = {},
  ) {
    return fetch(`http://127.0.0.1:3198/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Acadia-Request': '1',
        ...(cookie ? { Cookie: cookie } : {}),
        ...extraHeaders,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  try {
    let online = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try {
        if ((await request('/health')).ok) {
          online = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(online, serverOutput);
    let cookie = '';
    let studentState: unknown;
    await t.test('unauthenticated access is refused and password validation runs', async () => {
      assert.deepEqual(await (await request('/session')).json(), { email: null, state: null });
      assert.equal((await request('/me')).status, 401);
      assert.equal((await request('/state', 'PUT', {})).status, 401);
      assert.equal(
        (
          await request('/auth/signup', 'POST', {
            email: 'first@example.com',
            password: 'weak',
            name: 'First',
          })
        ).status,
        400,
      );
    });
    await t.test(
      'sign-up sets protected session cookie and starts without sample records',
      async () => {
        const response = await request('/auth/signup', 'POST', {
          email: 'FIRST@example.com',
          password: 'a-test-password-123',
          name: 'First',
        });
        assert.equal(response.status, 201);
        const setCookie = response.headers.get('set-cookie')!;
        assert.match(setCookie, /HttpOnly/);
        assert.match(setCookie, /SameSite=Strict/);
        cookie = setCookie.split(';')[0];
        const result = await response.json();
        studentState = result.state;
        assert.equal(result.email, 'first@example.com');
        assert.deepEqual(result.state.tasks, []);
        assert.equal(result.state.onboarded, false);
      },
    );
    await t.test('CSRF and malformed dates are rejected', async () => {
      assert.equal(
        (
          await request('/state', 'PUT', studentState, cookie, {
            Origin: 'https://attacker.example',
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await fetch('http://127.0.0.1:3198/api/state', {
            method: 'PUT',
            headers: { Cookie: cookie, 'Content-Type': 'application/json' },
            body: JSON.stringify(studentState),
          })
        ).status,
        403,
      );
      const state = structuredClone(studentState) as { tasks: unknown[] };
      state.tasks = [
        {
          id: '1',
          title: 'Invalid date',
          subject: '',
          date: '2026-02-30',
          time: 'After school',
          done: false,
        },
      ];
      assert.equal((await request('/state', 'PUT', state, cookie)).status, 400);
    });
    await t.test('valid plans persist and other accounts cannot access them', async () => {
      const state = structuredClone(studentState) as { tasks: unknown[] };
      state.tasks = [
        {
          id: '1',
          title: 'Private homework',
          subject: 'Math',
          date: '2026-10-26',
          time: 'After school',
          done: false,
        },
      ];
      assert.equal((await request('/state', 'PUT', state, cookie)).status, 200);
      assert.equal(
        (await (await request('/me', 'GET', undefined, cookie)).json()).state.tasks[0].title,
        'Private homework',
      );
      const response = await request('/auth/signup', 'POST', {
        email: 'second@example.com',
        password: 'another-good-password',
        name: 'Second',
      });
      const otherCookie = response.headers.get('set-cookie')!.split(';')[0];
      assert.deepEqual(
        (await (await request('/me', 'GET', undefined, otherCookie)).json()).state.tasks,
        [],
      );
    });
    await t.test('guide requires an account and honestly labels local mode', async () => {
      assert.equal((await request('/advisor', 'POST', { question: 'Help me' })).status, 401);
      const result = await (
        await request('/advisor', 'POST', { question: 'What classes should I take?' }, cookie)
      ).json();
      assert.equal(result.mode, 'local');
      assert.match(result.answer, /counselor/);
    });
    await t.test('logout invalidates the session; correct password logs back in', async () => {
      assert.equal((await request('/auth/logout', 'POST', {}, cookie)).status, 200);
      assert.equal((await request('/me', 'GET', undefined, cookie)).status, 401);
      assert.equal(
        (
          await request('/auth/login', 'POST', {
            email: 'first@example.com',
            password: 'wrong-password',
          })
        ).status,
        401,
      );
      const response = await request('/auth/login', 'POST', {
        email: 'first@example.com',
        password: 'a-test-password-123',
      });
      assert.equal(response.status, 200);
      cookie = response.headers.get('set-cookie')!.split(';')[0];
      assert.equal((await response.json()).state.tasks[0].title, 'Private homework');
    });
    await t.test('deletion requires password and removes account and sessions', async () => {
      assert.equal(
        (await request('/account', 'DELETE', { password: 'wrong-password' }, cookie)).status,
        401,
      );
      assert.equal(
        (await request('/account', 'DELETE', { password: 'a-test-password-123' }, cookie)).status,
        200,
      );
      assert.equal((await request('/me', 'GET', undefined, cookie)).status, 401);
      assert.equal(
        (
          await request('/auth/login', 'POST', {
            email: 'first@example.com',
            password: 'a-test-password-123',
          })
        ).status,
        401,
      );
    });
  } finally {
    server.kill('SIGTERM');
    await new Promise<void>((resolve) => {
      if (server.exitCode !== null) resolve();
      else server.once('exit', () => resolve());
    });
    await rm(directory, { recursive: true, force: true });
  }
});
