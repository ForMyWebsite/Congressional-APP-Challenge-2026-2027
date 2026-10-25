// Operator-only recovery tool. Never expose this as a web endpoint.
import { DatabaseSync } from 'node:sqlite';
import { writeFileSync } from 'node:fs';
const email = process.argv[2];
if (!email || !email.includes('@'))
  throw new Error(
    'Usage: npm run export:legacy -- account-email (only for an account you own or administer)',
  );
const db = new DatabaseSync('.data/acadia.sqlite', { readOnly: true });
try {
  const record = db
    .prepare('SELECT state FROM users WHERE email = ?')
    .get(email.toLowerCase().trim()) as { state: string } | undefined;
  if (!record) throw new Error('No matching legacy account. No data changed.');
  const state: unknown = JSON.parse(record.state);
  writeFileSync(
    '.data/legacy-planner.json',
    JSON.stringify({ format: 'acadia-legacy-v1', state }, null, 2),
    { flag: 'wx', mode: 0o600 },
  );
  console.log(
    'Recovery backup written to .data/legacy-planner.json. It contains personal planner data; keep it private. It is not a v2 import. No password or session data was exported.',
  );
} finally {
  db.close();
}
