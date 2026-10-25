# Catalogue source review

## Actual research outcome (2026-10-25)

Official HTTPS requests were attempted from the execution environment. Every request failed at the network proxy with `CONNECT tunnel failed, response 403`. No page content was retrieved, no browser/search tool was available, and no source review is claimed. Container/image registry access and Git access do not establish organizer-page access.

| Record                                  | Exact organizer URL attempted                                    | Outcome                         | What remains unknown                                                                                               |
| --------------------------------------- | ---------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| CMU Summer Academy for Math and Science | https://www.cmu.edu/pre-college/academic-programs/sams.html      | Proxy denied access; unreviewed | Current cycle, grades/age/geography, materials, cost/funding, location, format, deadline/timezone and availability |
| Congressional App Challenge             | https://www.congressionalappchallenge.us/students/student-rules/ | Proxy denied access; unreviewed | District participation, current rules/materials, fees, deadline/timezone and availability                          |
| CS50x learning resource                 | https://cs50.harvard.edu/x/2026/                                 | Proxy denied access; unreviewed | Current course details, prerequisites, access and optional certificate fees                                        |

These are discovery links, not endorsed offers or confirmed-open applications. Even successful future page retrieval will not establish a current open application unless the organizer explicitly states it. No affiliation or partnership is claimed. Resource access is not equivalent to program admission.

## Demonstration records

Engineering studio and Community design lab are **fictional examples**, in a separate Demo studio collection. Their sample evidence is written for interaction testing and is not organizer evidence. No real URL, deadline, review date or open application is invented. The free example explicitly excludes internet/device provision; the paid example separates its sample participation price from travel/meals. Demo facts never leak into the real catalogue.

## How to replace unknowns with reviewed facts

1. Retrieve the official organizer pages with access enabled (required destinations: `www.cmu.edu`, `www.congressionalappchallenge.us`, `cs50.harvard.edu`, plus only documented redirects as needed).
2. Check the exact current program cycle and application service. Record direct URLs and brief factual excerpts for each requirement, material, cost/funding claim and date.
3. Record last-reviewed date only after a human/source review. Distinguish free participation from travel, housing, equipment and fees. Preserve null for anything unstated.
4. Record a deadline date, time and IANA timezone only as actually stated. Confirm application status independently; a reviewed evergreen page does not mean applications are open.
5. Add source-cited requirement steps only for materials actually requested. Run matching, expired/closed-state and pathway tests. Re-review as cycles change.

## Fields and provenance

`src/data/catalogue.ts` contains records using the `Opportunity`/`SourceEvidence` contract. Source `status` is unreviewed, reviewed or demonstration. `reviewedAt` stays null here. Grade/age/region, participation cost, funding, extra costs, location, and deadline may be null. Availability is independent of source-review status. The UI shows both. Source excerpts are data and must never be treated as agent or model instructions.

The central real, source-checked journey remains externally blocked by source access. The fictional engineering journey is fully implementable and testable without claiming research occurred.
