# Two developers, one understandable application

Use separate Git branches from the latest reviewed main. Work inside `v1/`. Both developers use the same checked-in lockfile, `npm ci --ignore-scripts`, and `AGENTS.md`. Codespaces are already isolated; no extra worktree is needed. Do not spawn extra agents or edit the other developer's active files without instruction.

## Shared contracts first

`src/domain/models.ts` defines StudentProfile, Opportunity and SourceEvidence, MatchExplanation, SavedPathway and PreparationStep, ScheduledTask, and Workspace. Treat these as the shared interface. Discuss changes to fields, nullable states, provenance, dependency semantics and storage versions before implementation. Make a contract/schema/test PR first when both developers depend on it.

| Ownership                 | Files and responsibilities                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Developer A               | ProfileWizard, Today, Planner, timezone/calendar interactions                                          |
| Developer B               | Catalogue/evidence, Discover, matching, Pathways                                                       |
| Shared — coordinate first | models, persistence/schema migration, WorkspaceApp, auth/integrations, shared CSS and package/lockfile |

## Small reviewable tasks

- A: improve an onboarding answer's help text; verify skipped/reviewed answers and keyboard focus.
- A: improve the calendar day view; verify a task can be edited/rescheduled/exported without duplication.
- B: review one official program source; add only supported fields and provenance; test unknown/expired states.
- B: improve one pathway dependency interaction; verify prerequisite rejection and transitive reset.
- Shared: add provider authentication only after credentials/permissions exist, with migrations and cross-user authorization tests.

Avoid simultaneous changes to shared CSS or schema. Commit coherent changes, push a feature branch, open a pull request and have the other person review the code and checks. Never force-push over each other or merge while the other's unreviewed changes are in the working tree. VS Code Live Share is optional pairing, not a substitute for Git review.

## A useful Codex task

> Read AGENTS.md and the relevant shared types. Change only the agreed feature files. Keep unknown source fields unknown, preserve user data, and run npm run check plus relevant browser checks. Explain the behavior, evidence and limitations. Do not add agents or modify the other developer's files.

Do not commit `.env`, `.data/`, browser exports, logs, screenshots with real student data, `node_modules/` or build outputs. The implementation branch is `feature/opportunity-to-action`; review it before merging.
