import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
test('legacy recovery exports only student state and leaves the database unchanged', () => {
  const directory = mkdtempSync(join(tmpdir(), 'acadia-legacy-'));
  try {
    mkdirSync(join(directory, '.data'));
    const db = new DatabaseSync(join(directory, '.data/acadia.sqlite'));
    const state = { profile: { name: 'Test student' }, tasks: [] };
    db.exec('CREATE TABLE users (email TEXT, password TEXT, state TEXT)');
    db.prepare('INSERT INTO users VALUES (?, ?, ?)').run(
      'owner@example.test',
      'not-a-real-password',
      JSON.stringify(state),
    );
    db.close();
    const before = readFileSync(join(directory, '.data/acadia.sqlite'));
    execFileSync(
      process.execPath,
      [
        '--import',
        import.meta.resolve('tsx'),
        resolve('scripts/export-legacy.ts'),
        'owner@example.test',
      ],
      { cwd: directory, stdio: 'pipe' },
    );
    const backup = readFileSync(join(directory, '.data/legacy-planner.json'), 'utf8');
    assert.deepEqual(JSON.parse(backup).state, state);
    assert.ok(!backup.includes('not-a-real-password'));
    assert.deepEqual(readFileSync(join(directory, '.data/acadia.sqlite')), before);
    assert.throws(() =>
      execFileSync(
        process.execPath,
        [
          '--import',
          import.meta.resolve('tsx'),
          resolve('scripts/export-legacy.ts'),
          'owner@example.test',
        ],
        { cwd: directory, stdio: 'pipe' },
      ),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
