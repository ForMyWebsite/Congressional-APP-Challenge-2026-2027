# Acadia Edu contributor instructions

Work from the `v1/` app directory. Read `docs/SPEC.md` and `README.md` before changing behavior. Use Node 24+, `npm ci` and `npm run dev`. Cloud tasks already have an isolated checkout: use the existing checkout; do not create a worktree unless the user asks.

Use strict TypeScript and focused React components. Reuse domain schemas in `src/domain.ts`. Use native accessible controls and visible focus. Keep demo and real-account data isolated. Never present sample school data, inferred school affiliation, local planning rules, or provider discovery links as verified/live information.

Keep secrets server-side in ignored `.env`; never use a browser `VITE_` variable for an API key. Do not collect school passwords, report cards, or additional student data without explicit scope and consent work. Official Schoology/Alma integration requires approved credentials, not scraping.

Run `npm run check` and appropriate `npm run test:e2e` checks for behavior changes. Do not disable failing checks to get green. Document meaningful limitations. Do not commit/push or publish unless the user asks. Coordinate ownership of `src/App.tsx` when two contributors are active; avoid overwriting other changes.
