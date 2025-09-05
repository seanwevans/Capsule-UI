# eslint-config-capsule

Shared ESLint configuration for Capsule UI projects. It ships with a `capsule-ui/require-layer` rule that ensures runtime CSS strings declare an allowed `@layer`.

## Usage

Install ESLint and this config package:

```sh
pnpm add -D eslint eslint-config-capsule
```

Create an ESLint config, for example `.eslintrc.cjs`:

```js
module.exports = {
  extends: ['eslint-config-capsule'],
};
```

### Custom runtime styling libraries

The rule checks `css` tagged templates by default. Projects can allow additional APIs:

```js
module.exports = {
  extends: ['eslint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': ['error', { libraries: ['css', 'styled'] }],
  },
};
```

### Custom layer stacks

```js
module.exports = {
  extends: ['eslint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': ['error', { layers: ['utilities', 'components'] }],
  },
};
```

### Examples

**Web Components (Lit)**

```js
import { css } from 'lit';

export const buttonStyles = css`
  @layer components {
    :host { display: inline-block; }
  }
`;
```

**Framework components (React)**

```js
import { css } from '@emotion/css';

const button = css`
  @layer components {
    color: red;
  }
`;
```
