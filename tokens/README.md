# Tokens

Design tokens for Capsule UI.

The canonical token source lives in `tokens/source/tokens.json`. Token keys must be lowercase and may only contain letters, digits, hyphen (`-`), and underscore (`_`).

Example:

```json
{
  "color": {
    "brand-primary": { "$type": "color", "$value": "#fff" }
  }
}
```

## Build pipeline

The build script [`scripts/build-tokens.ts`](../scripts/build-tokens.ts) flattens the token tree, validates it against [`token.schema.json`](./token.schema.json), and writes generated artifacts to `dist/`.

Run:

```bash
pnpm tokens:build
```

to produce:

- `tokens.css` – CSS custom properties for each token.
- `tokens.json` – token values as JSON.
- `tokens.js` – JavaScript module exporting the token map.
- `tokens.d.ts` – TypeScript declarations for the token map.

`pnpm tokens:watch` rebuilds on changes and `pnpm tokens:validate` runs schema checks without writing files.

## Adding token categories

Create new categories by adding top-level keys in `tokens/source/tokens.json`. Each leaf token requires a `$type` and `$value`.

## Themes & brands

To support multiple themes or brand palettes, make a token's `$value` an object whose keys are theme names:

```json
"color": {
  "brand": {
    "$type": "color",
    "$value": { "light": "#ff0000", "dark": "#00ff00", "holiday": "#0000ff" }
  }
}
```

Every themed token must define a value for every theme. The build script automatically discovers all theme names. Use:

```bash
pnpm tokens:build -- --default-theme=<theme>
```

to choose which theme populates `:root` in the generated CSS.

## Generated outputs

Reference tokens via CSS custom properties, e.g. `var(--spacing-md)` or `var(--color-success)`. Color tokens swap values based on `[data-theme="dark"]` (and any additional themes); other categories share the same value across themes.

## Keeping artifacts in sync

`pnpm test` runs a check that rebuilds the tokens and fails if files in `dist/` change. If this occurs, run `pnpm tokens:build` and commit the updated artifacts.

## Figma sync

Use the Figma plugin in `plugins/figma-token-sync` to keep design and code aligned. Start the local server:

```bash
pnpm figma:sync-server
```

Then run the plugin inside Figma:

- **Pull** – apply the values from `tokens/source/tokens.json` to Figma variables.
- **Push** – write updated variables back to `tokens/source/tokens.json` and rebuild the generated artifacts.

Set a `FIGMA_SYNC_TOKEN` environment variable before starting the server and define the same value in the plugin's `SYNC_TOKEN`
constant to require authentication.

## Categories & usage

- **Color** – semantic tokens like `background`, `text`, `brand`, `success`, `warning`, and `error`.
- **Spacing** – a consistent scale from `xs` through `2xl` for margin and padding.
- **Typography** – font sizes, weights, and line heights for text styles.
- **Radius** – corner rounding options (`none` through `full`).
- **Z-index** – layering levels for overlays such as dropdowns, modals, and tooltips.
- **Motion** – standard transition durations (`fast`, `normal`, `slow`).

Reference tokens via CSS custom properties as shown above.

