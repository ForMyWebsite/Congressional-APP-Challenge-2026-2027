> Current extension: read [MAX-SPEC.md](MAX-SPEC.md) and [SETUP-MAX.md](SETUP-MAX.md). The newest user request adds live AI, established accounts, consent-based grades/screenshots and Max rewards; those requests supersede the earlier deferred scope below.

# Acadia Edu — opportunity, with a way forward

This release replaces the initial demo dashboard with a Next.js App Router + Tailwind student opportunity planner, focused on Pennsylvania grades 9–12. It stays in `v1/` and retains port 5173 and detached Codespaces startup. No extra agents are used.

## Shared capability contracts and order

1. `src/domain/models.ts`: StudentProfile, Opportunity/SourceEvidence, MatchExplanation, SavedPathway/PreparationStep, ScheduledTask and versioned Workspace.
2. Profile: optional answers and review; validated device-local guest persistence, recoverable imports, exports, deletion. No records seeded into the student's planner.
3. Catalogue: real unreviewed links separated from fictional demo records; every unknown explicit. Official sources are inaccessible through this execution environment's network (403), so no source review or live application status is claimed.
4. Matching: separate interests, apparent consistency, mismatches, missing info and questions; browse beyond matches.
5. Pathways: typed sourced requirements, optional suggestions and confirmation questions; dependency-aware completion and reset; student targets and self-reported status.
6. Scheduling: deterministic dependency order, time budgets, existing commitments, America/New_York dates, preview and explicit approval, edit/remove/complete/reschedule and ICS export.
7. Integration status, responsive UI, automated tests and documentation.

## Acceptance

A guest chooses grade/location/interests/free preference, explores an explicitly labeled engineering example, reads sample evidence, saves a pathway, chooses a target date, previews sessions around their commitments, approves, reloads, and continues. Real organizer links remain available with unreviewed/unknown information. Demo examples cannot masquerade as source-reviewed programs. A real source-checked journey awaits official-source access and review.

Established authentication, cross-device sync, school imports, external reminders and live AI are deferred without credentials/permissions. No custom account simulation is offered. Preserve `.data/acadia.sqlite` from the previous release; legacy accounts are not deleted or silently presented as guests' imported data.

## Commands / layout

`npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`. `src/app` App Router; `src/components` presentation; `src/domain` pure business rules and runtime contracts; `src/data` catalogue/evidence; `src/lib` persistence and exports; `tests` unit/integration/browser checks.

## Standards

Strict TypeScript and Zod. Small named components, native controls, focus management, visible focus and reduced motion. Always run checks, retain failing tests and show uncertainty. Never infer student ability/income from school, collect school passwords, fabricate sourced facts, put secrets in public variables, or save schedules without approval. Production identity, school permissions, data protection and legal requirements need qualified review before student launch.
