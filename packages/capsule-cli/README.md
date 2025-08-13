# Capsule CLI

The Capsule CLI provides utilities for working with Capsule UI.

## Usage

### Scaffold a component

```
node ./bin/capsule.js new component my-button
```

This command accepts the component name in any of the following formats:

- `my-button`
- `my_button`
- `myButton`

The name is converted to PascalCase (`MyButton`).

The scaffolding generates the following files:

- `MyButton.ts` – component stub
- `style.ts` – style API stub
- `index.ts` – re-export of the component
- `__tests__/MyButton.test.ts` – placeholder test

## Other commands

- `tokens build` – build design tokens
- `check` – run lint checks

