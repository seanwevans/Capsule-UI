# SSR Framework Examples

This directory contains reference integrations for server-side rendering with React, Vue and Svelte.
Each example renders a Capsule button on the server, hydrates it on the client and demonstrates variant
styling and basic accessibility attributes. CSS for Web Components is loaded using a customized
`<link rel="stylesheet" is='capsule-style'>` element. The `light-dom` folder shows how to render plain
HTML on the server and upgrade it to a Web Component on the client.

## Running an Example

Change into one of the framework folders and install dependencies:

```bash
pnpm install
pnpm run dev
```

Then visit `http://localhost:3000` in a browser to see the hydrated Capsule component.
