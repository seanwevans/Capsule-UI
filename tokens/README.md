# Tokens

Design tokens for Capsule UI.

Token keys must be lowercase and may only contain letters, digits, hyphen (`-`), and underscore (`_`).

Example:

```json
{
  "color": {
    "brand-primary": { "$type": "color", "$value": "#fff" }
  }
}
```

Run `pnpm tokens:build` to generate token artifacts in `dist/`:

- `tokens.css` - CSS custom properties for each token.
- `tokens.json` - token values as JSON.
- `tokens.js` - JavaScript module exporting the token map.
- `tokens.d.ts` - TypeScript declarations for the token map.

Example import:

```js
import tokens from '../dist/tokens.js';
```

## Categories & usage

- **Color** – semantic tokens like `background`, `text`, `brand`, `success`, `warning`, and `error`. Each color exposes `light` and `dark` values to support theming.
- **Spacing** – a consistent scale from `xs` through `2xl` for margin and padding.
- **Typography** – font sizes, weights, and line heights for text styles.
- **Radius** – corner rounding options (`none` through `full`).
- **Z-index** – layering levels for overlays such as dropdowns, modals, and tooltips.
- **Motion** – standard transition durations (`fast`, `normal`, `slow`).

Reference tokens via CSS custom properties, e.g. `var(--spacing-md)` or `var(--color-success)`. Color tokens swap values based on `[data-theme="dark"]`; other categories share the same value across themes.

