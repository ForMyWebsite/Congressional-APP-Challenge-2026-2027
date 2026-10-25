# Collaboration

Developer A owns profile, Today and calendar UI. Developer B owns catalogue, matching and pathway UI. Both agree changes to lib/domain.ts before implementation; persistence and authentication are shared decisions. Do not edit another developer's active files or spawn agents without instruction.

Reviewable next tasks: (1) split page.tsx into profile/Today/calendar and catalogue/pathway components without behavior changes; (2) research three official Pennsylvania engineering programs and add cited evidence contracts; (3) implement full filters; (4) connect Supabase with migrations and per-user policies; (5) add browser journey and accessibility checks; (6) reconcile task completion with pathway progress and prevent repeated schedule duplication. Each task needs a focused PR with tests and known limits.
