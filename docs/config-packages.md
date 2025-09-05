# Lint Configuration Packages

Capsule UI provides shareable configurations for both Stylelint and ESLint.
These presets include the custom `capsule-ui/require-layer` rule and sensible
defaults to encourage consistent styling practices.

## Stylelint

Install and extend the config:

```sh
pnpm add -D stylelint stylelint-config-capsule stylelint-declaration-strict-value
```

```js
// stylelint.config.cjs
module.exports = {
  extends: ['stylelint-config-capsule']
};
```

### Custom layer stacks

The config enforces an `@layer components` declaration by default.  Override the
rule to support different layer names:

```js
module.exports = {
  extends: ['stylelint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': { names: ['components', 'utilities'] }
  }
};
```

Disable the rule entirely when layers are not required:

```js
module.exports = {
  extends: ['stylelint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': null
  }
};
```

### Examples

**Web Components**

```js
// stylelint.config.cjs
module.exports = {
  extends: ['stylelint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': { name: 'components' }
  }
};
```

**React components**

```js
// stylelint.config.cjs
module.exports = {
  extends: ['stylelint-config-capsule'],
  rules: {
    'capsule-ui/require-layer': { names: ['theme', 'components'] }
  }
};
```

## ESLint

Install and extend the config:

```sh
pnpm add -D eslint eslint-config-capsule @typescript-eslint/parser
```

```js
// .eslintrc.cjs
module.exports = {
  extends: ['eslint-config-capsule']
};
```

### Allowing runtime styling libraries

The preset blocks common runtime CSS-in-JS libraries.  Override the rule to
permit specific libraries when needed:

```js
module.exports = {
  extends: ['eslint-config-capsule'],
  overrides: [
    {
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: '@emotion/react' },
              { name: '@emotion/styled' }
            ]
          }
        ]
      }
    }
  ]
};
```

### Examples

**Web Components**

```js
// .eslintrc.cjs
module.exports = {
  extends: ['eslint-config-capsule']
};
```

**Vue components**

```js
// .eslintrc.cjs
module.exports = {
  extends: ['eslint-config-capsule'],
  overrides: [
    {
      files: ['src/components/**/*.{js,ts,vue}'],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: [] } // allow runtime styling libraries
        ]
      }
    }
  ]
};
```
