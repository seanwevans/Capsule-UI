# Capsule Token Sync Figma plugin

A Figma plugin for two-way syncing Capsule UI design tokens.

- **Pull** – fetches `tokens/source/tokens.json` from the local repository and writes the values into Figma variables.
- **Push** – reads Figma variables and posts an updated token JSON back to the repo, triggering a token rebuild.

Start the local sync server (see [`scripts/figma-sync-server.ts`](../../scripts/figma-sync-server.ts)) and run the plugin inside Figma. The plugin expects the server to be available at `http://localhost:4141`.

## Authentication

Set the `FIGMA_SYNC_TOKEN` environment variable when starting the server to require an access token. Define the same value in `code.js` via the `SYNC_TOKEN` constant and the plugin will include it with each request.
