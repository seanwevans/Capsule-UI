# SSR Framework Examples

This directory contains reference integrations for server-side rendering with React, Vue and Svelte.
Each example renders a Capsule button on the server, hydrates it on the client and demonstrates variant
styling and basic accessibility attributes. The `light-dom` example shows how to output plain HTML as a
light‑DOM fallback and upgrade it to a custom element with no layout shift. The `css-modules` example
renders the class-based flavor and links its stylesheet during SSR to avoid flashes of unstyled content.
Framework folders illustrate how to preload the component's CSS Module so the markup renders styled on
first paint.

## Running an Example

For the `light-dom` and `css-modules` examples:

```bash
node server.js
```

Framework folders (`react`, `vue`, `svelte`) require dependencies:

```bash
pnpm install
pnpm run dev
```

Then visit `http://localhost:3000` in a browser to see the hydrated Capsule component.
