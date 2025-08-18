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

