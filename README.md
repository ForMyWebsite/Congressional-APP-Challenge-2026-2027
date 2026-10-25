# Acadia Edu

**Opportunity, with a way forward.** A Pennsylvania-first student opportunity navigator and practical planner.

The application is in [`v1/`](v1/). It now uses Next.js App Router, TypeScript and Tailwind. See [setup and current feature status](v1/README.md).

## Open without installing Node on your computer

Use [GitHub Codespaces](https://codespaces.new/ForMyWebsite/Congressional-APP-Challenge-2026-2027?ref=feature%2Fopportunity-to-action) on the `feature/opportunity-to-action` branch (or on main after the update is reviewed and merged). Setup installs tools in the cloud and starts the app. Open **Ports → 5173 → Open in Browser**. Keep that port private.

Already running an older version? Export any old planner data first. Update to the intended branch, run `npm ci --ignore-scripts` inside `v1/`, then stop and restart the Codespace to replace the old server. See [Codespaces details](v1/README.md#browser-only-github-codespaces). No repeated container rebuild is needed for ordinary source changes.

## Run locally in VS Code

Install Node.js 24+ and Git, open the repository, and run:

```sh
cd v1
npm ci --ignore-scripts
npm run dev
```

Open the local address printed in the terminal (port 5173). GitHub stores source code; a running Codespace or local server hosts this development preview.

## Try it honestly

Create a guest profile, discover a starting point, read its sources/unknowns, save a pathway, add schoolwork, preview preparation sessions and approve. Fictional examples are separated in Demo studio. Real organizer sources could not be reviewed through the execution environment's network, so those records explicitly retain unknown costs, eligibility, deadlines and availability. No login, live AI, school import or external reminder delivery is simulated.

[Architecture](v1/docs/ARCHITECTURE.md) · [Collaboration](v1/docs/COLLABORATING.md) · [Source findings](v1/docs/SOURCES.md) · [Feature status](v1/docs/ROADMAP.md) · [Usability guide](v1/docs/USABILITY.md) · [Competition demo outline](v1/docs/DEMO.md)
