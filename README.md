# Acadia Edu

The application lives in [`v1/`](v1/).

## Open without installing anything

[Create an Acadia Codespace](https://codespaces.new/ForMyWebsite/Congressional-APP-Challenge-2026-2027?ref=main)

Click **Create codespace**. Setup installs Node and dependencies in the cloud and starts the app automatically. Once ready, open the **Ports** tab and click the browser icon beside **5173**. Keep that port private. If you already have a Codespace, pull the latest main and run **Codespaces: Rebuild Container** from the command palette.

The app runs while the Codespace is running. It is a development workspace, not permanent public hosting. GitHub may require available Codespaces quota.

## View the app locally

Install Node.js 24 or newer, clone this repository, and open the repository in VS Code. In the terminal run:

```sh
cd v1
npm ci
npm run dev
```

Open **http://localhost:5173** in your browser while the terminal stays running. Start with the sample workspace or create a test account. GitHub displays the source code; it does not automatically host this full-stack app.

See [app documentation](v1/README.md) and [working together](v1/docs/COLLABORATING.md).

If an older Codespace opens in recovery mode with `node: command not found`, run `git pull origin main`, then use **Codespaces: Rebuild Container**. The configuration uses the official `node:24-bookworm` image.
