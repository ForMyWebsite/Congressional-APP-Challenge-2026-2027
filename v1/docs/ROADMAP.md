# Max update status

Implemented: real provider adapters with free-only OpenRouter mode; welcome and Supabase Google/email account flows; authenticated API/database migration and revision checks; manual school/courses/periods/grades; reviewed screenshot import; recurring classes/clubs; Day/Week/Month/Year calendars; reminders; Max chat/history and approved task suggestions; pet coins, shop, feeding and v2→v3 migration.

Requires external setup: OpenRouter (or deliberately selected paid OpenAI) credentials and a supported model; Supabase project/public configuration, SQL migration and Google/email settings. These live integrations and the supplied RLS isolation SQL have not been exercised without credentials. Free vision models may be unavailable. Schoology/Alma still need official school arrangements and APIs. Public launch still requires privacy/consent, provider terms, recovery/deletion and operational review.

Earlier core delivery and remaining research work:

# Implemented, demonstration, and deferred

## Implemented

- Next.js App Router, strict TypeScript, Tailwind and reusable accessible React controls.
- Today, Discover, My Pathways, Calendar, and Profile & Settings.
- Optional guided profile answers with review; Pennsylvania grade 9–12 coverage made explicit.
- Guest-only versioned persistence, validated import, recovery warnings, JSON and Eastern-time ICS export, explicit deletion.
- Search and interest/type/cost/location/format/grade filters; browse beyond interest matches.
- Five-part deterministic explanations, costs/unknowns, source evidence/detail view, independent application status.
- Saved pathways with typed steps/citations, notes, targets and self-reported statuses; dependency-aware completion/reset.
- Whole-block, budget-aware scheduling preview, conflict and unscheduled-step reporting, explicit approval, task edits/completion/removal/rescheduling.
- Honest integration status; working in-app due-task reminders; detached Codespaces startup with version/readiness checks.

## Demonstration / unreviewed

- Two fictional examples in Demo studio. Their sample evidence, eligibility and costs are not real organizer statements; neither has an application.
- Three real organizer discovery links with source review pending. Network access was denied, so no current requirements, costs, deadlines or open applications are asserted.
- The complete engineering-to-approved-schedule demonstration is testable. A real source-checked program journey is not yet verified.

## Deferred / prerequisites

- Official source review and maintained current opportunities: enable organizer HTTPS access, review source excerpts, current cycles and deadlines; retain null for unstated facts.
- Established email authentication / sync: configure an approved provider, migrations, row-level user authorization, recovery/session flows and cross-user tests. Previous local accounts are retained for recovery, not exposed by a new login.
- Live AI: provider credentials, age-appropriate consent and privacy review; bounded sourced context, output checks, cost limits and no autonomous schedule changes.
- Schoology/Alma: school approval, official docs, sandbox credentials, scoped authorization, consent, provenance and revocation. No school passwords or invented imports.
- Email/push: opt-in channels, quiet hours, reliable job delivery and delivery records. In-app reminders do not prove external delivery.
- Real-student launch: qualified privacy/legal/consent review for ages and jurisdiction, school approval where relevant, secure hosting, retention/deletion policy, backup recovery, incident handling, monitoring and accessibility review. No compliance or outcome claim is made.

Before scaling, assess recurring commitments, more than one availability window, transport/travel time, multiple timezones, shorter/split preparation steps, and multi-device conflict resolution against actual student needs.
