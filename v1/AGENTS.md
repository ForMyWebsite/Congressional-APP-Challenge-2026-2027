# Acadia Edu contributor instructions

Work from `v1/` with Node 24+. Read `docs/SPEC.md`, `docs/ARCHITECTURE.md` and `README.md`. This is Next.js App Router + Tailwind. Cloud tasks already have an isolated checkout; do not create a Git worktree unless the user asks. Do not spawn additional agents without explicit user instruction.

Shared contracts live in `src/domain/models.ts`: StudentProfile, Opportunity/SourceEvidence, MatchExplanation, SavedPathway/PreparationStep, ScheduledTask and versioned Workspace. Agree on contract changes before parallel work. Developer A owns profile/Today/calendar; B owns catalogue/matching/pathways. Authentication, persistence and contract changes are shared. Avoid editing another person's active work.

Keep presentation in `src/components`, pure rules in `src/domain`, evidence in `src/data`, persistence/exports in `src/lib`, App Router files in `src/app`. Reuse schemas at trust boundaries. Do not add server accounts without established authentication and tested per-user database authorization.

Never present fictional examples or unreviewed organizer links as verified facts. Unknown cost is not free. Saved does not mean registered/applied/accepted. Student targets are not official deadlines. Questions are not requirements. Reopening prerequisites must reconcile dependent steps and sessions. Schedule changes require preview/approval and visible conflicts. Do not collect school passwords, report cards, exact addresses or health details. Keep private keys out of public variables and logs.

Preserve `.data/acadia.sqlite`, old browser keys and user changes. Do not auto-import old sample assignments. Imports and deletion require explicit student actions. Use native accessible controls, visible focus, source citations and honest empty states.

Run `npm run check` and relevant `npm run test:e2e` checks (build first). Do not suppress or remove failed assertions. Check formatting and known dependency advisories. Keep port 5173 and the detached Codespaces startup (`nohup setsid`); no separate API is needed. Push a feature branch and prepare a PR when authorized; do not merge or publish without user instruction.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
