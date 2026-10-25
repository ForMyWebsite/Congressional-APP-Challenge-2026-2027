# Max, accounts and school planner

The newest user request authorizes a welcome page, established Google/email authentication with database persistence, school/course/current-grade entry, optional consent-based screenshot extraction, richer calendar views, recurring clubs/classes, an actual AI called Max, schedule suggestions that require approval, reminders and a pet/coin shop. These requirements supersede earlier restrictions against collecting voluntarily entered grades or connecting AI/auth.

Build order: migrate shared models without losing v2 data → provider boundaries/auth and RLS → welcome/account isolation and sync → school/manual/screenshot review → Max chat and approved plan suggestions → calendar views/recurrence/reminders → idempotent task rewards and Max shop → tests/docs/feature branch.

Credentials are absent in the execution workspace; the user can configure Supabase and OpenAI in Codespaces secrets. Implement real provider routes, never fake replies, sign-ins or imports. Google provider setup and Supabase SQL migration are prerequisites. Schoology/Alma require school-approved APIs; do not collect their passwords or claim a connection without access. Manual entry remains fully useful.

Student screenshots require explicit consent, image-only size/type validation, editable extracted data preview and confirmation before saving. Do not retain original images or send student identifiers automatically to the model. Guest data stays device-local; authenticated cloud data uses owner-only policies, server validation and revision checks. Explain untested live integrations honestly.

Rewards are cosmetic: completing an existing task earns coins once per task ID; toggling never farms coins. Suggestions never change the schedule automatically. Browser notifications are opt-in and work only while the app is open; background/email/push delivery is not claimed.
