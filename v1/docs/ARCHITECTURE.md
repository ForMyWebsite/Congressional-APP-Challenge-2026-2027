# Architecture and code walkthrough

## Why this shape

One Next.js application is enough. App Router serves the application shell and `/api/health`; the student interface uses client components. Tailwind v4 is processed through PostCSS, with a shared CSS design system for repeated layout and focus rules. Fonts are bundled locally. Port 5173 stays stable to preserve the working Codespaces setup.

There is no custom identity server, fake login, multi-user database or model simulator. No established-provider credentials were available. The former SQLite database is retained for recovery and is never read by public web routes. This makes the guest limits explicit and keeps the core useful without integrations.

## Read the code in this order

1. **`src/domain/models.ts`** — shared strict TypeScript contracts inferred from Zod for stored user data; source/opportunity contracts; schema version 2; cycle, reference and completion consistency checks.
2. **`src/data/catalogue.ts`** — independent organizer records and evidence. Real unreviewed links and fictional examples are distinguished in data, not just by a visual badge. Read `SOURCES.md` for actual access failures.
3. **`src/domain/matching.ts`** — deterministic set comparisons return five separate explanation categories. No eligibility percentage or inferred ability. Browsing is never restricted to matches.
4. **`src/domain/pathways.ts`** — saving creates typed steps. Completion checks prerequisites. Reversing a step traverses dependent links and reopens their completion states; `completeStep` also reconciles linked sessions.
5. **`src/domain/scheduling.ts`** — topological ordering, fixed-day capacity and occupied-time checks. Pure preview returns proposed sessions, conflicts and unscheduled steps; it never writes state. The UI commits a preview only on explicit approval. Preview starts tomorrow, uses an Eastern-time preparation window and considers up to 90 days. Existing scheduled steps are not duplicated. Task edits check overlaps and dependency order.
6. **`src/lib/storage.ts` / `useWorkspace.ts`** — Zod validates stored/imported state. Hydration reads browser storage after the server render. Corrupt raw data is preserved for explicit recovery, and unavailable storage is reported. No cross-device synchronization is implied.
7. **`src/lib/exports.ts`** — JSON download and RFC 5545 ICS export. Calendar output escapes text, folds UTF-8 lines, and includes America/New_York DST definitions. Student tasks are not presented as organizer deadlines.
8. **`src/components/WorkspaceApp.tsx`** — lightweight navigation, shared state and dialogs. Today, Discover, Pathways, Planner, Settings, and ProfileWizard own presentation for their workflows. Native dialog provides focus trapping; mobile navigation has explicit keyboard handling and inert hidden controls.

## Decisions students should be able to explain

- Why unknown cost cannot pass the “free participation” filter.
- Why reviewed program details and open applications are separate claims.
- Why a question is not a requirement, and why suggestions remain optional.
- Why dependencies affect scheduling and why reopening a prerequisite reopens dependent progress.
- Why a schedule is a preview until the student approves it; partial plans explicitly identify unscheduled steps.
- Why guest local storage cannot promise login or sync, and how export/recovery/deletion work.

## Limits and failure recovery

Scheduling uses whole 25-minute preparation blocks, a single daily availability window, and one fixed timezone for the Pennsylvania pilot. It does not optimize commute time or split long steps. If a block does not fit, the student can extend a target/change time settings; the UI never silently exceeds the budget. Multi-device merge, recurring commitments and native mobile/offline installation are not implemented. Users must export before clearing browser data.

Calendar-time edits of preparation sessions enforce ordering and budget; they do not automatically move dependent sessions. Conflicts explain what the student needs to change. Optional suggestions may be left undone; progress counts preparation steps, not application completeness or acceptance.

## Future established-provider boundary

When an approved provider such as Supabase is actually configured, add migrations and per-user database policies, server-side validation and authenticated authorization. Test cross-user reads/writes/deletes with real isolated test users. Keep source records separate from student data. Do not enable identity merely because a public project URL exists. No authorization claims are made for the current guest-only planner.
