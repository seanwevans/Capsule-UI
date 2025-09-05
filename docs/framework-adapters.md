# Framework adapters

Capsule ships tiny wrappers so its Web Components fit naturally into
popular frameworks. Each adapter forwards attributes and events and
exposes the same Style API – CSS variables, `::part`, and attributes.

## React

```bash
pnpm add @capsule-ui/react
```

```jsx
import { CapsButton } from '@capsule-ui/react';

export function Demo() {
  return (
    <CapsButton
      className="caps-btn"
      style={{ '--caps-btn-bg': '#ff3b3b' }}
      theme="dark"
    >
      Save
    </CapsButton>
  );
}
```

```css
.caps-btn::part(button) { text-transform: uppercase; }
```

## Vue

```bash
pnpm add @capsule-ui/vue
```

```vue
<script setup>
import { CapsButton } from '@capsule-ui/vue';
</script>

<template>
  <CapsButton
    class="caps-btn"
    style="--caps-btn-bg:#ff3b3b"
    theme="dark"
  >
    Save
  </CapsButton>
</template>

<style>
.caps-btn::part(button) { text-transform: uppercase; }
</style>
```

## Svelte

```bash
pnpm add @capsule-ui/svelte
```

```svelte
<script>
  import { CapsButton } from '@capsule-ui/svelte';
</script>

<CapsButton
  class="caps-btn"
  style="--caps-btn-bg:#ff3b3b"
  theme="dark"
>
  Save
</CapsButton>

<style>
  .caps-btn::part(button) { text-transform: uppercase; }
</style>
```

CSS variables can be set via the `style` attribute or on ancestor
elements. Attributes like `theme` or `variant` map to component
variants. Parts targeted with `::part(...)` remain the sanctioned way to
customize internals.
