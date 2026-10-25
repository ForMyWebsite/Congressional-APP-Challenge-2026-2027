# Acadia Edu — opportunity, with a way forward

A Pennsylvania-first student opportunity navigator and planner for grades 9–12. Next.js App Router, strict TypeScript, Tailwind CSS, accessible React controls, and pure matching/scheduling rules. The planner works without accounts or AI.

## Open the app

Use Node.js **24+**. In VS Code open `v1/`, then:

```sh
npm ci --ignore-scripts
npm run dev
```

Open port **5173**. Keep the terminal running. For a production preview: `npm run build`, then `npm start` (also port 5173). This is still a development release, not approved production hosting for student data.

### Browser-only GitHub Codespaces

Create a Codespace on the feature branch (or main after merging). The root `.devcontainer` installs Node 24 and dependencies, then starts Next.js automatically. In the **Ports** tab open **5173** in your browser; keep the port private.

If updating an existing Codespace, export your old planner first, pull the intended branch, run `npm ci --ignore-scripts` from `v1/`, then **stop and restart the Codespace** so the existing server is replaced. Alternatively stop your dev terminal with Ctrl+C and run `bash ../.devcontainer/start.sh`. The script will report an occupied port rather than silently accepting an old app. It retains `nohup setsid` to survive Codespaces lifecycle shutdown. Inspect `/tmp/acadia-dev.log` if startup fails. No separate API on port 3001 is needed anymore.

## Try the complete journey

1. **Today → Set up my profile:** choose grade 10, Pennsylvania, Engineering, free preference, preparation minutes and available weekdays. Review and save. All answers are optional; skipped time answers do not become assumed availability.
2. **Calendar:** add a real assignment or commitment, including its duration.
3. **Discover → Demo studio:** open Engineering studio. Read the fictional sample evidence, costs, unknowns and matching explanation. Save it.
4. **My Pathways:** choose your own target date within 90 days; preview the suggested preparation sessions. Review conflicts and any unscheduled steps. Approve only if the plan suits you.
5. Complete steps in order. Reopening a prerequisite resets its dependent steps and linked task completions.
6. Reload and continue. Export a JSON backup or an Eastern-time ICS calendar from Settings.

**The engineering example is fictional. No real application exists.** The real source-checked journey cannot yet be claimed: organizer pages were blocked during this execution's research. Real organizer links remain separate and unreviewed, with costs, requirements and availability explicitly unknown. See [source review](docs/SOURCES.md).

## Persistence and privacy

This is an **unauthenticated guest workspace**. Profile, tasks and pathways are saved in this browser's local storage under `acadia-workspace-v2`. There is no cross-device sync. A different forwarded URL/browser is a different storage location. Clearing site data deletes access to the planner. Use export/import to move a valid v2 planner between devices. Imports require explicit replacement approval. Invalid or unreadable storage is not silently overwritten; recovery download and start-fresh controls are provided.

Deleting guest data clears the v2 workspace in this browser. It does not delete downloaded exports, data on other origins/devices, or the preserved legacy database. No student data is sent to an AI provider. No report-card grades, school passwords, health details, income or exact addresses are collected. This is not a claim of legal/privacy compliance.

### Earlier version recovery

The previous custom email/password system has been retired from the running app in favor of an honest guest workflow until an established provider is configured. The ignored `.data/acadia.sqlite` database remains untouched. Legacy browser demo data (`acadia-demo-v1`) is not automatically imported because it contains invented sample assignments. Existing v1 backups are not valid v2 imports.

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

## Honest integration status

No Supabase credentials were present. Email authentication and synchronized multi-user storage are **not configured**, with no simulated login. No AI credential was present; no live guide is connected and no model response is simulated. Schoology/Alma are **not connected**; official school documentation, approval, permissions and credentials are required. Reminders are **in-app only**, not email or push. `.env.example` contains no secrets, and private keys must never use `NEXT_PUBLIC_` variables.

## Understand and build together

- [Architecture and code walkthrough](docs/ARCHITECTURE.md)
- [Feature status and launch requirements](docs/ROADMAP.md)
- [Shared types and collaboration ownership](docs/COLLABORATING.md)
- [Source-review findings](docs/SOURCES.md)
- [Student usability test](docs/USABILITY.md)
- [Congressional App Challenge demo outline](docs/DEMO.md)
- [Specification and acceptance criteria](docs/SPEC.md)
