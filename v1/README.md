# Acadia Edu

A little direction. A world of possibility.

Acadia is a student planning web app: a daily dashboard, calendar, checklists, interest-based opportunity discovery, an in-app reminder center, and a contextual planning guide. It runs on desktop and mobile browsers. This is a working development release, not a live school integration.

## Run in VS Code

Install **Node.js 24 or newer**, **Git**, and **VS Code**. Clone this repository and open its folder in VS Code. In the terminal:

```sh
npm ci
npm run dev
```

Vite prints the local web address. The API starts on port 3001; the web app starts on port 5173. Open the web address printed by Vite. The default screen is a sample student workspace, so you can explore immediately. For your own empty workspace, select **Create your free account** and finish your profile. Accounts use email and password; school email is encouraged, not required. **Email and school membership are not verified in this release. Use test data.**

Demo changes stay in that browser's local storage. Account data is stored in `.data/acadia.sqlite`, which is ignored by Git. Two people using local copies have separate databases. Don't share the database file or real student records through Git.

## What works

- Responsive dashboard with a daily checklist, progress, upcoming events, and calendar.
- Add, complete, and delete tasks; add and delete events; browse and select dates.
- Edit name, self-reported school, grade, ambitions, interests and activities.
- Curated opportunity links, explainable interest matching, filters and saved items.
- In-app reminders from planner events; read/unread state.
- Workspace search across tasks, events and opportunities.
- Local email/password accounts, hashed passwords, expiring server sessions, account isolation and persistent SQLite data.
- JSON data export and password-confirmed account deletion.
- Local rule-based planning suggestions; optional live AI with explicit student consent.

## Optional live AI

Copy `.env.example` to `.env` and set `ACADIA_AI_API_KEY` to a server-side OpenAI API key. Restart the dev server. Sign into an account, open **Acadia guide**, and enable the live AI consent checkbox. The server sends the question, grade, and interests; it does not automatically send name, email, school, tasks, or grades. Avoid including personal information in questions. AI replies can be wrong and must be checked. Provider usage may incur costs.

The key is never bundled into the browser. Never put it in a `VITE_` variable or commit `.env`. No key is required for the default local guide. Failed AI requests fall back to labeled local guidance. Live provider integration is implemented but was not exercised without credentials.

## Checks

```sh
npm run check        # Strict TypeScript, production build, API and domain tests
npm audit           # Known dependency vulnerabilities
npx playwright install chromium
npm run test:e2e    # Real-browser flows, mobile layout and automated WCAG AA checks
```

On this cloud machine, tests use the preinstalled `/usr/bin/chromium`. Elsewhere Playwright uses its installed Chromium. To use another compatible binary, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path. Automated accessibility checks supplement keyboard and visual review; they are not a full accessibility certification.

```sh
npm run build
npm start
```

`npm start` serves the built app and API together. For a deployed server, configure `APP_ORIGIN` to the exact HTTPS origin and keep `.data/` on a persistent volume. Production cookies require HTTPS; plain HTTP production sign-in is intentionally unsupported. SQLite is appropriate for a single server process, not multiple independently writing hosts. Serve behind an HTTPS reverse proxy and do not expose the development server publicly.

## Work with your friend and Codex

VS Code is a good fit. Both of you can open your own clone and use Codex on separate branches. Read [the collaboration guide](docs/COLLABORATING.md) before dividing work. The repository includes VS Code tasks and `AGENTS.md` for consistent instructions to both Codex sessions. Git branches and reviewed pull requests are the source of truth; Live Share can help when pairing in one editor.

## School systems and launch scope

Schoology and Alma are **not connected**. The connection screen explains that official school-approved API/OAuth access is required. The app never asks for school passwords. An email domain does not reliably identify a student's school, prove enrollment, or grant access to records.

No report cards are imported. There is no automatic school-event feed, external messaging, email/push delivery, verified email, password recovery, or live deadline feed. Opportunity cards are discovery links to real providers, not current offers or guaranteed eligibility. Demo schedules and the demo school are illustrative.

Before real students use accounts, complete verified email and recovery, school authorization, privacy and age/consent requirements, secure hosting and backups, and operational security review. Account deletion removes active application rows and sessions; it does not promise physical erasure from SQLite WAL pages or operator backups. Set a documented backup retention and deletion process before launch. See [the product specification](docs/SPEC.md) and [next steps](docs/ROADMAP.md).

## Structure

```text
src/App.tsx                 Workspace shell and shared student state
src/components/             Forms, calendar, task/event lists and visual elements
src/pages/                  Student guidance screen
src/domain.ts               Shared schemas, sample data and guidance rules
src/styles.css              Responsive design system
server/index.ts             API, SQLite persistence, sessions, optional AI
tests/                     Domain/API tests and browser tests
docs/                      Product scope, collaboration and launch roadmap
```
