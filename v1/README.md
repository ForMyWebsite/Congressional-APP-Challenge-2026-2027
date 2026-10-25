# Acadia Edu — meet Max

A student planner with an interactive AI guide, school/course setup, calendar and a pet named Max. This release adds a welcome screen, Supabase Google/email accounts and cloud storage, manual courses/periods/grades, consent-based screenshot extraction, recurring classes/clubs, four calendar views, reminders and cosmetic task rewards.

**Live AI and sign-in require your provider setup.** Max now supports **free-only OpenRouter routing**, with no automatic paid model fallback. Use an OpenRouter key for OpenRouter, not an OpenAI key. See [the exact setup guide](docs/SETUP-MAX.md) for secrets, database migration and Google redirect URLs. Free model limits/availability and image support vary; manual entry always works. Live account and model access was not verified without credentials in this execution workspace.

## Open the app

Use Node.js **24+**. In VS Code open `v1/`, then:

```sh
npm ci --ignore-scripts
npm run dev
```

Open port **5173**. Keep the terminal running. For a production preview: `npm run build`, then `npm start` (also port 5173). This is still a development release, not approved production hosting for student data.

### Browser-only GitHub Codespaces

Create a Codespace on the `feature/max-school-planner` branch (or main after merging). The root `.devcontainer` installs Node 24 and dependencies, then starts Next.js automatically. In the **Ports** tab open **5173** in your browser; keep the port private.

If updating an existing Codespace, export your old planner first, pull the intended branch, run `npm ci --ignore-scripts` from `v1/`, then **stop and restart the Codespace** so the existing server is replaced. Alternatively stop your dev terminal with Ctrl+C and run `bash ../.devcontainer/start.sh`. The script will report an occupied port rather than silently accepting an old app. It retains `nohup setsid` to survive Codespaces lifecycle shutdown. Inspect `/tmp/acadia-dev.log` if startup fails. No separate API on port 3001 is needed anymore.

## Try the complete journey

1. **Today → Set up my profile:** choose grade 10, Pennsylvania, Engineering, free preference, preparation minutes and available weekdays. Review and save. All answers are optional; skipped time answers do not become assumed availability.
2. **Calendar:** add a real assignment or commitment, including its duration.
3. **Discover → Demo studio:** open Engineering studio. Read the fictional sample evidence, costs, unknowns and matching explanation. Save it.
4. **My Pathways:** choose your own target date within 90 days; preview the suggested preparation sessions. Review conflicts and any unscheduled steps. Approve only if the plan suits you.
5. Complete steps in order. Reopening a prerequisite resets its dependent steps and linked task completions.
6. Reload and continue. Export a JSON backup or an Eastern-time ICS calendar from Settings.

**The engineering example is fictional. No real application exists.** The real source-checked journey cannot yet be claimed: organizer pages were blocked during this execution's research. Real organizer links remain separate and unreviewed, with costs, requirements and availability explicitly unknown. See [source review](docs/SOURCES.md).

## Guest persistence and privacy

When you choose **Explore as a guest**, this is an **unauthenticated guest workspace**. Profile, tasks and pathways are saved in this browser's local storage under the existing `acadia-workspace-v2` key (schema v3, with v2 migration). There is no cross-device sync. A different forwarded URL/browser is a different storage location. Clearing site data deletes access to the planner. Use export/import to move a valid v2/v3 planner between devices. Imports require explicit replacement approval. Invalid or unreadable storage is not silently overwritten; recovery download and start-fresh controls are provided.

Deleting guest data clears the v2 workspace in this browser. It does not delete downloaded exports, data on other origins/devices, or the preserved legacy database. AI data is sent only when students consent to a Max request or screenshot extraction; course/grade sharing is a separate opt-in. Recent chat is stored with the planner. No report-card grades, school passwords, health details, income or exact addresses are collected. This is not a claim of legal/privacy compliance.

### Earlier version recovery

The previous custom email/password system has been retired from the running app in favor of an honest guest workflow until an established provider is configured. The ignored `.data/acadia.sqlite` database remains untouched. Legacy browser demo data (`acadia-demo-v1`) is not automatically imported because it contains invented sample assignments. Existing v1 backups are not valid v2/v3 imports.

For a legacy account you own/administer, the local operator can run `npm run export:legacy -- account-email` inside `v1/`. It opens the legacy database read-only and creates a private `.data/legacy-planner.json` backup, refusing to overwrite a file. It never exports passwords or sessions. Review and manually transfer needed tasks; automatic conversion is deferred. Keep that backup out of Git. If you need to operate the old UI for an export, the earlier version is preserved in Git history; do not reset an active working checkout blindly.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm audit
```

`npm run check` runs lint, types, domain/integration tests and the production build. Browser tests run the built Next.js app on isolated port **5174**. Build first. This cloud workspace uses `/usr/bin/chromium`; elsewhere run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. `npm run format` / `npm run format:check` handle formatting. Automated WCAG AA checks supplement visual and keyboard testing; they are not certification.

## Current connection status

- **Max:** real OpenRouter/free-only and optional deliberately configured OpenAI calls; clear unavailable/error states without invented replies. Student approves proposed sessions before adding them.
- **Accounts:** Supabase Google/email and revision-checked private workspaces are implemented. Apply the included SQL and project configuration before enabling them. Live auth and database RLS tests require your project.
- **Schoology/Alma:** not connected without approved school access. Manual school/classes/grades and recurring clubs work now; screenshot extraction requires image-capable AI and reviewed approval.
- **Reminders:** in-app plus optional browser alerts while Acadia is open. No background email/push delivery.
- **Max pet:** 10 coins once per completed task, gear shop and feeding. Cosmetic only; no real-money purchases.

## Understand and build together

- [Architecture and code walkthrough](docs/ARCHITECTURE.md)
- [Feature status and launch requirements](docs/ROADMAP.md)
- [Shared types and collaboration ownership](docs/COLLABORATING.md)
- [Source-review findings](docs/SOURCES.md)
- [Student usability test](docs/USABILITY.md)
- [Congressional App Challenge demo outline](docs/DEMO.md)
- [Specification and acceptance criteria](docs/SPEC.md)
