# Capsule UI 💊

## Wut?
Treat styling as a *contract* between the host page and the component. 
Capsule gives you sealed components (Shadow DOM or CSS Modules) plus a tiny, well-documented “Style API” so teams stop renegotiating “how we style” on every project.
Isolated styles by default, instant theming via CSS variables, safe customization via `::part`, and responsive by **container queries**. No runtime CSS-in-JS.
Inspired by [this article](https://denodell.com/blog/we-keep-reinventing-css).

For developers migrating from Tailwind or CSS‑in‑JS, see the [migration and adoption guide](docs/migration-guide.md).

---

## Why?
- **Isolation by default.** Your host CSS can’t leak in; component CSS can’t leak out.
- **Theming at runtime.** Flip brands/tenants by setting CSS variables—no rebuilds.
- **Tenant isolation.** `ThemeManager` scopes tokens per tenant so styles can't leak across boundaries.
- **Predictable overrides.** Only what you expose is customizable (`::part`, CSS vars).
- **Fast.** Plain CSS or compile-time utilities; zero runtime styling engine.
- **Local responsiveness.** Container queries adapt to *the space you give the component*.
- **Governable.** Layers, tokens, and CI checks eliminate specificity wars and drift.

## Core ideas
### 1) Scope by default
Pick one:
- **Shadow DOM** (Web Components) → true encapsulation, customized via CSS variables and `::part`.
- **CSS Modules** (framework components) → per-file scoping + `@layer` for order.

### 2) Tokens are the only globals
Design tokens become **CSS custom properties** (and optional TS types). All component styles reference tokens; hosts theme by swapping token sets (e.g., `<body data-theme="dark">`), not by editing component code.

### 3) Layers enforce order—not specificity
A single project-wide contract:
```css
@layer reset, base, utilities, components, overrides;
```
- `reset` — normalizer + box-sizing
- `base` — typography, page bg
- `utilities` — low-specificity helpers
- `components` — component-local styles (Capsule lives here)
- `overrides` — explicit escape hatch

Use `:where(...)` inside components to keep specificity low and stable.

### 4) Variants compile to classes, not runtime CSS
Props map to **recipes** that produce class names at build time (e.g., CVA, Panda, UnoCSS, stylex’s compiled mode). No runtime styled-components/emotion unless you truly need dynamic computed styles.

Example:

```js
import { buttonRecipe } from '@capsule-ui/core/button.recipe';
import { cardRecipe } from '@capsule-ui/core/card.recipe';

const btnClass = buttonRecipe({ size: 'lg', variant: 'secondary' });
const cardClass = cardRecipe({ variant: 'outline' });
```

Each core component ships with a matching recipe (e.g., `inputRecipe`, `selectRecipe`, `tabsRecipe`, `modalRecipe`) for CSS Module workflows.

### 5) Container‑query first
Components adapt to their container:
```css
:host { container-type: inline-size; }
@container (min-width: 420px) { /* ... */ }
```

### 6) The Style API (the only sanctioned customization surface)
- **CSS variables** (tokens + component variables)
- **Parts** via `::part(...)` when using Shadow DOM
- **Attributes** for variants (e.g., `theme="dark"`, `variant="ghost"`, `density="compact"`)

Everything else stays private.

---

## Preview components

An early preview package `@capsule-ui/core` publishes foundational elements for experimentation:

- `<caps-button>` – styled button element
- `<caps-input>` – basic text input
- `<caps-card>` – surface container
- `<caps-tabs>` – tabbed interface
- `<caps-modal>` – modal dialog
- `<caps-select>` – styled select element

Install with `pnpm add @capsule-ui/core` and try them in your project. Early adopters are encouraged to experiment and share feedback while these components evolve.

### Framework adapters

Prefer to stay in a framework? Tiny adapters wrap the Web Components so
they behave like native React, Vue, or Svelte components:

- `@capsule-ui/react`
- `@capsule-ui/vue`
- `@capsule-ui/svelte`

Each forwards attributes and events and keeps the same Style API for
`::part`, CSS variables, and attributes. See
[framework adapter docs](docs/framework-adapters.md) for usage examples.


## Quick start (vanilla, using the demo widget)
Drop this into any HTML page:

```html
<script type="module">
  import "https://cdn.jsdelivr.net/gh/your-org/capsule-ui/examples/booking-widget.js";
</script>

<booking-widget id="w"></booking-widget>

<script>
  // Theme at runtime: flip a token
  document.getElementById("w").style.setProperty("--bk-brand", "#ff3b3b");
  // Set a variant
  document.getElementById("w").setAttribute("theme", "dark");
</script>
```

### Safe host customization
```css
booking-widget::part(button) { text-transform: uppercase; }
booking-widget::part(card)   { border-radius: 24px; }
```

> Don’t want Web Components? Use the CSS Modules flavor and expose the same Style API via module classes and token variables.

---

## Accessibility & i18n baseline

Capsule components don’t bypass accessibility—they expose focus rings,
keyboard navigation and ARIA roles by default. CSS custom properties respect
`prefers-reduced-motion` and `prefers-contrast` so hosts can theme high‑contrast
or motion‑reduced modes. Locale helpers (`getLocale`, `setLocale`,
`formatNumber`, `formatDate`) wire up RTL/LTR and locale‑aware formatting.
See [Component Accessibility Checklist](docs/a11y-checklist.md).

---

## Example: minimal Capsule widget (Shadow DOM)
```js
customElements.define("booking-widget", class extends HTMLElement {
  constructor(){
    super();
    const r = this.attachShadow({mode:"open"});
    const style = document.createElement("style");
    style.textContent = `
        @layer reset, base, components;
        :host{
          --bk-brand: #4f46e5; --bk-text: #0f172a;
          container-type: inline-size; display:block; color:var(--bk-text);
        }
        :host([theme="dark"]){ --bk-text:#e6e8ef; }
        @layer base {
          .button{ background: var(--bk-brand); color:white; border:0; padding:.7rem 1rem; border-radius:12px; }
        }
      `;
    const btn = document.createElement("button");
    btn.className = "button";
    btn.setAttribute("part", "button");
    btn.type = "button";
    btn.textContent = "Book";
    r.append(style, btn);
  }
});
```

---

## Governance & CI
Capsule works best with a few non-negotiables:

- **ADR: Style Contract** (checked in): scope-by-default, tokens-only, layers order, variant strategy, container-queries-first.
- **Lint rules (stylelint/eslint):**
  - Only tokenized colors/spacing (ban raw hex/rgb except in token files).
  - Max specificity `0-1-0`; no `!important` outside `@layer overrides`.
  - Disallow global element styling in component CSS.
  - Require `@layer components` in component CSS files; override the layer name with `CAPSULE_LAYER_NAMES="utilities,components"` or disable with `CAPSULE_LAYER_NAMES=off`.
- **Build checks:** fail if runtime CSS-in-JS packages are imported in components (allow-list exceptions). Set `CAPSULE_ALLOW_RUNTIME_STYLES=true` to permit one-off dynamic styles and use CSS-in-JS only for cases that can’t be expressed with tokens or precompiled utilities.
- **Bundle budgets:** `pnpm run check:bundle-size` gates bundle size growth in CI.
- **Governance flags:** `CAPSULE_LAYER_NAMES` and `CAPSULE_ALLOW_RUNTIME_STYLES` are escape hatches. Use them sparingly and see [governance flag guidelines](docs/governance-flags.md) for trade-offs and review practices.
- Existing CSS-in-JS solutions can interoperate by generating token-based classes and injecting them into `@layer overrides`.
- **Storybook + VRT:** each component shows theme × density × locale, with visual regression tests.
## Architecture Decision Records
See [docs/adr](docs/adr/README.md) for existing decisions and guidance on writing new ones.

---

## FAQ
**Isn’t this just Tailwind?**  
Similar goals (speed, predictability), different contract. Capsule exposes *Style APIs* (vars/parts) and supports runtime theming and true encapsulation; Tailwind is app-global utilities and usually build-time theming.

**Do I need Web Components?**  
No. Shadow DOM is great for embeddables. For app-internal components, CSS Modules + layers work well.

**What about SSR?**  
- Web Components: hydrate like any custom element; attach shadow CSS at connect time. For SEO-critical content, render a light-DOM placeholder, then upgrade.
- Framework flavor: standard framework SSR, since styles are modules at build time.

**Browser support?**  
Shadow DOM v1, `::part`, and container queries are supported in all modern evergreen browsers. For legacy support, use the CSS Modules flavor and avoid Shadow-only features.

**Accessibility?**
Capsule doesn’t bypass a11y—your components still need focus states, ARIA, contrast, keyboard handling, and reduced-motion respect. The isolation helps keep a11y styles consistent.

## Tokens
Source tokens live in `tokens/source/tokens.json` using the W3C draft design tokens structure. The build pipeline is implemented in [`scripts/build-tokens.ts`](./scripts/build-tokens.ts) and runs via `pnpm tokens:build` to generate `dist/tokens.css`, `dist/tokens.d.ts`, and `dist/tokens.json`. The CSS file exposes custom properties for the built-in `light`, `dark`, and `ocean` themes; toggling `[data-theme="dark"]` (or any other theme name) on the page swaps the values.

For development convenience, `pnpm tokens:watch` monitors `tokens/source/tokens.json` and rebuilds the output whenever it changes.

### Runtime theme switching

Use helpers from `@capsule-ui/core` to switch themes by updating the `data-theme` attribute:

```js
import { setTheme, getTheme, onThemeChange } from '@capsule-ui/core';

setTheme('dark'); // <html data-theme="dark">
console.log(getTheme());
const stop = onThemeChange(t => console.log('theme', t));
```

Add a new theme by defining values for it in `tokens/source/tokens.json` and rebuilding with `pnpm tokens:build`. Then call `setTheme('<name>')` or set `<html data-theme="<name>">` at runtime.

For multi-tenant apps, `ThemeManager` can load and switch tenant-specific presets without a page reload:

```js
import { ThemeManager } from '@capsule-ui/core';

await ThemeManager.load('tenantA', '/themes/tenant-a.json');
ThemeManager.applyTheme('tenantA', 'dark');
```

### Theming lab

Designers can experiment with token values in the [theming lab](docs/theming-lab.md).
The page updates components live as you tweak CSS variables and can export a JSON preset for reuse.

### Theme registry

Shareable presets can be uploaded to a lightweight [theme registry](docs/theme-registry.md).
Each upload receives a unique URL that teams can reference at runtime or package for
distribution on npm. Browse, fetch, and reuse themes without copying token files
between projects.

---


## Documentation
A public documentation site built with Docusaurus lives in `website`. Run `pnpm docs:dev` to start a local server or `pnpm docs:build` to generate static files.

## CLI

Capsule provides a published command line interface.

### Installation

```bash
pnpm add -g capsule-cli
```

### Usage

```bash
capsule new component Button  # scaffolds component, tests, docs and ADR stub
capsule tokens build          # runs the token pipeline (pnpm run tokens:build)
capsule check                 # runs lint, token and test checks
```
