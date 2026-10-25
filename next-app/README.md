# Acadia Edu — Next.js pathway checkpoint

This app is a new guest-only implementation alongside the preserved `v1/` application. Node 24+ required.

```sh
cd next-app
npm ci
npm run dev
```

Development uses port 5174. In VS Code open the repository and run these commands. For browser-only GitHub Codespaces, create a Codespace from this branch, open its terminal, run the same commands, and privately forward port 5174 in the Ports tab. The existing devcontainer still starts v1 on 5173; this checkpoint does not replace it.

Checks: `npm run lint` (strict type checking), `npm test`, `npm run build`. No separate ESLint rules are configured yet.

## Architecture and walkthrough

`app/layout.tsx` supplies the App Router shell and metadata. `app/page.tsx` contains the guest interface and explicit write boundary. `lib/domain.ts` defines Zod workspace contracts, matching, dependency reconciliation, date-only scheduling and calendar export. `lib/domain.test.ts` exercises these without a web server. `app/globals.css` loads Tailwind and the responsive visual system. Persistence is version 1 browser localStorage, validated on restore. Corrupted records are retained for export until explicit reset; write failures surface an alert. No data is sent to a server by this guest implementation.

The schedule preview consumes the daily budget after manually entered workload. It places whole preparation steps in dependency order and returns an explicit conflict instead of a partial plan. Approval is required before persistence. Tasks are all-day calendar records, not timed reservations or email reminders. Pathway prerequisite reversal clears downstream completion and removes that pathway's scheduled sessions to avoid stale plans.

## Implemented / demonstration / deferred

Implemented: optional three-stage profile with review, local guest persistence, basic search/free filter, explainable matches, saved pathways, dependency-aware completion, personal target and application-status tracking, schedule preview/approval, manual dated workload, rescheduling/removal/completion, JSON export, ICS export, deletion and responsive navigation.

Demonstration: one synthetic engineering exploration record, explicitly labeled on every catalogue card. No real program, eligibility determination, source review, application deadline, or organizer partnership is represented. All preparation steps are optional suggestions or questions.

Deferred: researched real catalogue, full faceted filters, dedicated opportunity routes, task title/duration editing, time-of-day scheduling, richer schema migrations, browser integration/accessibility automation for this new app, established provider authentication and database authorization, source-grounded AI, notifications, school integrations. Existing v1 authentication is not reused or presented as provider authentication. No Supabase configuration was supplied. This checkpoint does not yet satisfy the complete requested product.

## Privacy and launch review

Guest data is unauthenticated, device-local and lost if browser storage is cleared. Export before switching devices. Do not store real student records during development. Before student launch obtain qualified review of privacy notices, ages/consent, retention/deletion, accessibility, security, school approvals and applicable law; no compliance claim is made. School passwords are never requested. Alma and Schoology remain unavailable without official arrangements.
