# Max update verification

## Executed here

- ESLint and strict TypeScript checks.
- Domain tests for v2→v3 migration, idempotent task coins, shop/feeding, recurrence dates, minimized AI context, image validation, bounded requests and free-only routing using an explicit test transport.
- Existing matching/pathway/scheduling/storage/recovery tests retained.
- Production Next.js build.
- Browser tests cover welcome/guest entry, school courses and grades, recurring commitments, four calendar views, rewards persistence, AI reply/approval UI using a mocked endpoint, reviewed screenshot UI using a mocked endpoint, schema migration, and unauthorized endpoints. Existing end-to-end journey retained.
- Automated WCAG checks include welcome and all new screens. Mocked responses exist only in tests; the product has no fake model fallback.

## External checks still needed

No live provider credentials or project access were available in the execution workspace. Therefore **real OpenRouter/OpenAI responses, vision-model availability, Google/email sign-in, cross-device Supabase persistence, the live SQL isolation test and actual school imports were not verified**. Keys configured by the user in a separate Codespace do not automatically appear in this environment. Follow SETUP-MAX.md and run a small real request plus separate-account tests once configured.

Schoology/Alma connectors are not implemented without official access. No background email/push delivery is claimed. Notification permission/desktop presentation depends on browser support and settings; in-app reminder rendering is testable independently. Student privacy/legal/provider-data terms require review before real student deployment. Free provider access and limits may change; no permanent zero-cost hosting or quota is promised.

Latest result: **28 unit/domain/recovery/provider-boundary tests and 12 browser tests passed**, along with lint, strict types, production build and formatting. Dependency audit reported zero known vulnerabilities. Welcome and Max pet/shop screenshots were visually reviewed. A free-only rejection test proves paid model IDs are refused before the test transport is invoked; it does not replace real-provider configuration checks.
