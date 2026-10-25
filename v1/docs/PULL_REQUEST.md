# Add Max AI, accounts, school planner and pet rewards

Acadia previously had no interactive model guide or account entry screen. This update adds a welcome/sign-in experience, real Supabase Google/email authentication and account-owned storage, a school setup flow, an interactive Max guide, and a cosmetic Max pet.

Max supports free-only OpenRouter routing (paid model IDs refused, zero-price provider preference, no automatic paid fallback), with an explicitly configured OpenAI alternative. Both actual provider calls and screenshot extraction are server-side and consent-based; responses/imports are validated. Course/grade sharing is separately optional. Proposed sessions need approval and are checked against recurring commitments and existing tasks. No fake responses or school logins are included.

Manual courses/periods/optional grades, recurring classes/clubs, Day/Week/Month/Year calendar views and reviewed screenshot drafts are included. In-app reminders and opt-in browser alerts work while the app is open; background delivery is not claimed. Max earns cosmetic coins once per task completion, with feeding and gear purchase/equipping. V2 browser data migrates to V3; legacy SQLite data is preserved.

Supabase migration enables owner-only RLS and revision-checked saves. Server routes require authenticated users, validate state, and reject untrusted writes. A disposable-project SQL isolation test is supplied. Guest and account state are isolated; cloud errors/conflicts stop saves rather than overwriting data.

Validation: lint, strict types, 28 tests, production build, 12 browser tests, automated accessibility, formatting and dependency audit passed. Provider response and extraction UI tests use explicitly mocked transports only in tests. No live AI credentials or Supabase project were available here: actual model access, Google/email login, cross-device persistence and the supplied live SQL test remain unverified until configured. Schoology/Alma remain unconnected without official school arrangements.

See docs/SETUP-MAX.md for free-only API secrets, database migration, Google redirects and privacy/retention limits. Review against feature/opportunity-to-action; do not merge or deploy without review.
