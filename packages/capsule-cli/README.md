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
- `style.ts` – default style factory
- `index.ts` – re-export of the component
- `__tests__/MyButton.test.ts` – smoke test exercising the style factory
- `docs/components/my-button.md` – documentation stub
- `docs/adr/NNN-my-button.md` – ADR template using the style contract

Example generated files:

```ts
// MyButton.ts
import { createMyButtonStyles } from './style';

export const MyButton = () => {
  const styles = createMyButtonStyles();
  return `<button class="${styles.root}">MyButton</button>`;
};

// style.ts
export interface MyButtonStyleProps {
  variant?: 'primary' | 'secondary';
}

export const createMyButtonStyles = ({ variant = 'primary' }: MyButtonStyleProps = {}) => ({
  root: variant === 'primary' ? 'caps-button--primary' : 'caps-button--secondary',
});
```

## Migrate existing code

Use built-in codemods to migrate common patterns to Capsule components:

```
capsule migrate tailwind src/**/*.tsx
capsule migrate emotion src/
```

The Tailwind codemod recognises utility classes like `btn`, `input`, `card`, `tabs`, `modal` and `select`, even inside dynamic `className` expressions (`clsx`, template literals, etc.). Matched elements are replaced with the corresponding Capsule components and a `variant` prop when a `*-foo` class is present. The Emotion codemod removes `styled.button` declarations and swaps their usages for `CapsButton` imports.

## Other commands

- `tokens build` – build design tokens
- `tokens validate` – validate design tokens
- `tokens watch` – rebuild tokens on source changes
- `check` – run lint, token and test checks
- `migrate <tailwind|emotion> [paths...]` – apply codemods to migrate existing code to Capsule

## Installation

```bash
pnpm add -g capsule-cli
```

This exposes a global `capsule` command.

