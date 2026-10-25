import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyWorkspace, workspaceSchema } from '../src/domain/models';
import { awardTaskCoins, petAction } from '../src/domain/pet';
import { recurringTasks } from '../src/domain/school';
import { maxContext } from '../src/domain/max';
import { validateImage } from '../src/lib/server/image';
import { callModel } from '../src/lib/server/provider';

test('old v2 planners migrate to school and pet defaults without losing work', () => {
  const old = { ...emptyWorkspace(), version: 2 };
  delete (old as Partial<typeof old>).school;
  delete (old as Partial<typeof old>).pet;
  const next = workspaceSchema.parse(old);
  assert.equal(next.version, 3);
  assert.deepEqual(next.school.courses, []);
  assert.equal(next.pet.coins, 0);
});
test('coins award once for completing an existing task and cannot be farmed by reopening', () => {
  let before = emptyWorkspace();
  before.tasks = [
    {
      id: 't1',
      title: 'Study',
      date: '2026-11-01',
      time: '16:00',
      minutes: 30,
      category: 'Assignment',
      done: false,
      pathwayId: null,
      stepId: null,
    },
  ];
  let after = awardTaskCoins(before, {
    ...before,
    tasks: before.tasks.map((t) => ({ ...t, done: true })),
  });
  assert.equal(after.pet.coins, 10);
  before = { ...after, tasks: after.tasks.map((t) => ({ ...t, done: false })) };
  after = awardTaskCoins(before, {
    ...before,
    tasks: before.tasks.map((t) => ({ ...t, done: true })),
  });
  assert.equal(after.pet.coins, 10);
  assert.equal(petAction(after, 'cap').error !== null, true);
});
test('pet shop charges once, equips owned gear, and bounds feeding', () => {
  let state = emptyWorkspace();
  state.pet.coins = 100;
  state = petAction(state, 'bandana').workspace;
  assert.equal(state.pet.coins, 80);
  state = petAction(state, 'bandana').workspace;
  assert.equal(state.pet.coins, 80);
  assert.equal(state.pet.equipped, null);
  state = petAction(state, 'feed').workspace;
  assert.equal(state.pet.energy, 80);
  assert.equal(state.pet.coins, 75);
});
test('recurrences respect chosen weekdays and inclusive term dates', () => {
  const state = emptyWorkspace();
  state.school.commitments = [
    {
      id: 'bio',
      title: 'Biology',
      category: 'Class',
      weekdays: [1, 3],
      time: '09:00',
      minutes: 45,
      startDate: '2026-11-01',
      endDate: '2026-11-08',
    },
  ];
  const tasks = recurringTasks(state, '2026-11-01', '2026-11-15');
  assert.deepEqual(
    tasks.map((t) => t.date),
    ['2026-11-02', '2026-11-04'],
  );
});
test('AI context omits name and school; grades require a separate opt-in', () => {
  const state = emptyWorkspace();
  state.school.name = 'Private school name';
  state.profile.nickname = 'Private name';
  state.school.courses = [{ id: 'c', name: 'Physics', period: '3', grade: 'C+' }];
  assert.ok(!JSON.stringify(maxContext(state, false)).includes('Private'));
  assert.deepEqual(maxContext(state, false).courses, []);
  assert.equal(maxContext(state, true).courses[0].grade, 'C+');
});
test('screenshot boundary rejects SVG, fake MIME and oversized files', () => {
  assert.throws(() => validateImage('data:image/svg+xml;base64,PHN2Zz4='));
  assert.throws(() =>
    validateImage(
      'data:image/png;base64,' + Buffer.from('this is not an image').toString('base64'),
    ),
  );
  assert.throws(() =>
    validateImage('data:image/png;base64,' + Buffer.alloc(4 * 1024 * 1024 + 1).toString('base64')),
  );
});
test('free-only provider refuses paid model IDs before making any request', async () => {
  const previous = { provider: process.env.ACADIA_AI_PROVIDER, model: process.env.ACADIA_AI_MODEL };
  process.env.ACADIA_AI_PROVIDER = 'openrouter';
  process.env.ACADIA_AI_MODEL = 'paid/model';
  try {
    await assert.rejects(
      callModel('not-a-real-key', [], 'chat', async () => {
        throw new Error('Must not be called');
      }),
      /rejects paid/,
    );
  } finally {
    if (previous.provider === undefined) delete process.env.ACADIA_AI_PROVIDER;
    else process.env.ACADIA_AI_PROVIDER = previous.provider;
    if (previous.model === undefined) delete process.env.ACADIA_AI_MODEL;
    else process.env.ACADIA_AI_MODEL = previous.model;
  }
});
test('real-provider adapter sends zero-price routing and validates an actual response shape using a test transport', async () => {
  const previous = { provider: process.env.ACADIA_AI_PROVIDER, model: process.env.ACADIA_AI_MODEL };
  process.env.ACADIA_AI_PROVIDER = 'openrouter';
  process.env.ACADIA_AI_MODEL = 'openrouter/free';
  try {
    const result = await callModel(
      'not-a-real-key',
      [{ role: 'user', content: 'Help me study' }],
      'chat',
      async (url, init) => {
        assert.equal(String(url), 'https://openrouter.ai/api/v1/chat/completions');
        const body = JSON.parse(String(init?.body));
        assert.deepEqual(body.provider.max_price, { prompt: 0, completion: 0 });
        assert.equal(body.provider.data_collection, 'deny');
        return Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  answer: 'Break the material into small practice sessions.',
                  proposals: [],
                }),
              },
            },
          ],
        });
      },
    );
    assert.ok('answer' in result);
    await assert.rejects(
      callModel('not-a-real-key', [], 'chat', async () => new Response('limited', { status: 429 })),
      /No paid fallback/,
    );
  } finally {
    if (previous.provider === undefined) delete process.env.ACADIA_AI_PROVIDER;
    else process.env.ACADIA_AI_PROVIDER = previous.provider;
    if (previous.model === undefined) delete process.env.ACADIA_AI_MODEL;
    else process.env.ACADIA_AI_MODEL = previous.model;
  }
});
test('bounded request reader and origin guard reject oversized or cross-site requests', async () => {
  const { readJSON, validOrigin } = await import('../src/lib/server/http');
  assert.equal(
    validOrigin(
      new Request('https://app.example/api/max', {
        method: 'POST',
        headers: {
          'x-acadia-request': '1',
          origin: 'https://attacker.example',
          host: 'app.example',
        },
      }),
    ),
    false,
  );
  await assert.rejects(
    readJSON(new Request('https://app.example', { method: 'POST', body: 'x'.repeat(100) }), 20),
    /too large/,
  );
  assert.deepEqual(
    await readJSON(
      new Request('https://app.example', { method: 'POST', body: '{"ok":true}' }),
      100,
    ),
    { ok: true },
  );
});
