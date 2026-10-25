# Building Acadia together in VS Code

## First shared commit

The app files are created but are not automatically committed or pushed. Review them, then use VS Code's Source Control panel to create the first commit and push a `main` branch to the shared GitHub repository. Invite your friend as a repository collaborator. Never include `.env`, `.data/`, `node_modules/`, exported student data, or private records.

Each teammate then clones the repository, runs `npm ci`, and starts `npm run dev`. Both can use the Codex extension independently.

## Divide work by files

A practical first split:

- Teammate A: planner and dashboard interaction improvements.
- Teammate B: verified authentication or an approved school integration.

Before a session, agree on the files each person owns. `src/App.tsx` is shared workflow code, so coordinate changes to it rather than editing it independently at the same time. Extract a feature into a focused component when that helps avoid overlap; don't add abstraction simply for a possible future feature.

For each change, create a named branch from updated `main`, for example `feature/planner-reminders`. Tell Codex the objective and acceptance criteria, such as:

> Read AGENTS.md and docs/SPEC.md. Add a task filter to the planner. Keep authentication and school connections unchanged. Work in the planner files only. Run npm run check and the relevant browser tests. Explain what changed and any limitations.

Push your branch and open a pull request. The other teammate reviews it, confirms checks, and merges. Update `main` locally before starting the next branch. Don't share a single branch for simultaneous Codex sessions, force-push over each other, or commit while the other session is changing those same files.

## Live pairing

VS Code Live Share is useful when one person drives and the other reviews. It shares an editing session; it does not replace commits, pull requests or branch coordination. Keep terminals containing credentials private.

## What to ask your school

Ask a school administrator whether a student project can obtain a sandbox or approved developer access to Schoology or Alma. Ask which official authentication flow, scopes, API endpoints, retention rules and consent requirements apply. Use a test school and test student data. Do not collect passwords or scrape authenticated student portals.

Keep the first competition demo focused: create a student profile → add a goal → plan a day → discover an accessible opportunity → explain the recommendation. Clearly label sample data and the limits of the guide.
