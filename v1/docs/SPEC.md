# Acadia Edu: first working release

A responsive student web app that gives students a clear view of their day and affordable opportunities. VS Code and Node 24 are the development baseline.

## Capabilities and build order

| Module    | Responsibility                                                            | Depends on                  |
| --------- | ------------------------------------------------------------------------- | --------------------------- |
| student   | Demo, local email/password accounts, editable goals and school profile    | —                           |
| planner   | Dated tasks, calendar events, daily completion, reminders                 | student                     |
| discovery | Curated opportunity directory, transparent interest matching, saved items | student                     |
| guidance  | Local contextual planning suggestions; optional server-side OpenAI        | student, planner, discovery |

Build student → planner → discovery → guidance. School data is self-reported. This release does not verify email, import report cards, connect school systems, send email/push notifications, or provide person-to-person messaging. The inbox is an in-app reminder center. Never present sample deadlines or demo data as live school information.

## Acceptance criteria

- Dashboard renders with a clearly labeled sample profile and responsive navigation.
- Demo tasks, events, bookmarks and profile persist on the current browser; account data persists in SQLite and is isolated by session.
- Student can add/complete/delete tasks, add calendar events, browse months, filter/save opportunities, read reminders and edit a profile.
- Sign-up/login uses email and password. School email is encouraged, never required. School affiliation is editable and unverified.
- Personalized guidance explains its basis. Live AI requires a server credential; fallback is explicitly labeled. No student email, name, school or grades are sent to the AI provider.
- Profile export and deletion work. No school passwords or report cards are collected.
- TypeScript, production build, API/domain tests, and browser flows pass.

## Commands and structure

`npm ci`, `npm run dev`, `npm run check`, `npm run test:e2e`, `npm start` (after build).
`src/` React UI and shared domain types; `server/` Express, SQLite, sessions; `tests/` Node and Playwright tests; `docs/` operating and product context.

## Standards

Strict TypeScript, named focused components, native form validation plus Zod at the API boundary. Example: `const remaining = tasks.filter(task => !task.done);`. React encodes all rendered text. Native controls, visible focus, dialog focus management, semantic headings and reduced motion support.

Always preserve failing checks and keep secrets on the server. Changes to real school connections, student data retention, external messaging or production authentication require a separate implementation review. Never claim demo data is verified or promise educational outcomes.

## Production requirements

Verified email and password recovery, school-approved OAuth/API credentials, deployment with HTTPS and persistent database backups, a privacy/consent policy suitable for student ages and jurisdiction, account abuse controls backed by shared storage if scaling, and operational monitoring. These are remaining launch work, not working features.
