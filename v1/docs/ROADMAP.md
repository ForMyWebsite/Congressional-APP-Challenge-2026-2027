# Next steps toward a real student service

## Identity and trust

- Replace development-only identity with verified email, secure password recovery and appropriate session/account management. Reassess account enumeration and brute-force controls with a managed identity service.
- Decide intended student ages, geography, school involvement, consent, data retention and accessibility requirements. Write student-readable privacy terms before collecting real records.
- School email may suggest a domain; students must confirm their school. Verify affiliation through a school-approved identity provider before importing records.

## Approved connections

- Obtain sandbox credentials and documentation from Schoology/Alma through the school. Implement OAuth/official auth server-side with state validation, least-privilege scopes, refresh/revocation and per-student authorization.
- Add explicit consent for each category of school data. Avoid collecting report cards unless they are necessary for a specific student-facing feature.
- Add import provenance, sync status, timezone handling, deduplication, and manual corrections. Never silently replace a student’s entries.

## Recommendations and reminders

- Maintain a reviewed opportunity source with actual availability, eligibility, costs, accommodations, location, transport and last-checked timestamps.
- Keep recommendations explainable and let students override interests. Audit access barriers and biased suggestions; do not let a predicted career constrain course choices.
- Add opt-in email/push delivery with per-channel settings, quiet hours, reliable background jobs and delivery records. An in-app reminder is not proof of delivery.
- Live AI is optional. Confirm provider data terms and consent for minors; add abuse controls, evaluation examples and cost limits before enabling it at scale.

## Operations

- Production HTTPS, persistent database storage, migrations, backups and restore drills; retention that covers SQLite/WAL files and backups.
- Shared rate limiting and a suitable database if adding replicas. Reverse-proxy and IP trust configuration must match the actual deployment.
- Automated checks on pull requests, request/error monitoring without student data, dependency maintenance and incident handling.
- Validate a newly published cloud task; saving setup instructions does not verify snapshot restoration.
