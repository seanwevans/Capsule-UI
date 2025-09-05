# Migration and Adoption Guide

Capsule embraces **encapsulation**, **runtime theming** and a flexible **style API**. If you're coming from utility-first frameworks like Tailwind or CSS‑in‑JS libraries such as styled‑components, this guide will help you translate familiar patterns into Capsule idioms.

## Tailwind utilities → Capsule variants

Tailwind encourages long strings of utility classes. Capsule replaces these with component APIs and design tokens.

### Button example

**Tailwind**

```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Save
</button>
```

**Capsule**

```tsx
import { button } from '@capsule-ui/react';

export function SaveButton() {
  return <button class={button({ color: 'primary', size: 'md' })}>Save</button>;
}
```

Variants express intent (`color="primary"`) while tokens drive the final style.

## CSS-in-JS → Capsule tokens

CSS‑in‑JS libraries co-locate styles with components. Capsule instead leans on design tokens and runtime theming.

### styled-components button

```tsx
import styled from 'styled-components';

const Button = styled.button`
  padding: ${(p) => p.theme.spacing[2]};
  background: ${(p) => p.theme.colors.blue[500]};
  color: white;
  border-radius: 0.25rem;
  &:hover { background: ${(p) => p.theme.colors.blue[600]}; }
`;
```

### Capsule equivalent

```tsx
import { button } from '@capsule-ui/react';

export const Button = (props) => (
  <button class={button({ color: 'primary', size: 'sm', ...props })} />
);
```

Tokens and variants replace ad-hoc style objects.

## Mapping design tokens

Capsule expects tokens grouped by category. Map your existing design tokens to Capsule's JSON structure:

```json
{
  "color": {
    "primary": { "value": "{palette.blue.500}" },
    "primary-hover": { "value": "{palette.blue.600}" }
  },
  "space": { "2": { "value": "0.5rem" } },
  "radius": { "sm": { "value": "4px" } }
}
```

Run `pnpm tokens:build` to compile them into CSS variables used by Capsule components.

## Automated assistance

Codemods can speed up migration by converting utilities and styled components to Capsule APIs. Check out the [Capsule codemods](https://github.com/CapsuleUI/codemods) for automated assistance.

---

Once your tokens are mapped and components rewritten, Capsule's runtime theming lets you swap presets or adjust variables on the fly without rebuilding.
