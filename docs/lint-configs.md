# Lint configuration packages

Capsule UI provides shareable configurations for Stylelint and ESLint so projects can enforce consistent layering rules across static stylesheets and runtime styling.

## Packages

- `stylelint-config-capsule`
- `eslint-config-capsule`

## Extending the config

Both packages enable the `capsule-ui/require-layer` rule. The rule expects a `@layer components` declaration by default.

### Different layer stacks

Override the allowed layers in your project:

```jsonc
// .stylelintrc.json
{
  "extends": ["stylelint-config-capsule"],
  "rules": {
    "capsule-ui/require-layer": { "names": ["utilities", "components"] }
  }
}
```

```js
// eslint.config.js
module.exports = {
  extends: ['eslint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': ['error', { layers: ['utilities', 'components'] }],
  },
};
```

### Allowing runtime styling libraries

The ESLint rule checks `css` template tags or function calls. You can allow additional APIs:

```js
module.exports = {
  extends: ['eslint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': ['error', { libraries: ['css', 'styled'] }],
  },
};
```

## Examples

### Web Components (Lit)

```js
import { css } from 'lit';

export const cardStyles = css`
  @layer components {
    :host { display: block; }
  }
`;
```

### Framework components (React)

```js
import { css } from '@emotion/css';

const card = css`
  @layer components {
    padding: 1rem;
  }
`;
```
