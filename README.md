# Capsule UI
Isolated styles by default, instant theming via CSS variables, safe customization via `::part`, and responsive by **container queries**. No runtime CSS-in-JS.

> TL;DR: Treat styling as a *contract* between the host page and the component. Capsule gives you sealed components (Shadow DOM or CSS Modules) plus a tiny, well-documented “Style API” so teams stop renegotiating “how we style” on every project.

---

## Why Capsule?
- **Isolation by default.** Your host CSS can’t leak in; component CSS can’t leak out.
- **Theming at runtime.** Flip brands/tenants by setting CSS variables—no rebuilds.
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

## Example: minimal Capsule widget (Shadow DOM)
```js
customElements.define("booking-widget", class extends HTMLElement {
  constructor(){
    super(); const r = this.attachShadow({mode:"open"});
    r.innerHTML = `
      <style>
        @layer reset, base, components;
        :host{
          --bk-brand: #4f46e5; --bk-text: #0f172a;
          container-type: inline-size; display:block; color:var(--bk-text);
        }
        :host([theme="dark"]){ --bk-text:#e6e8ef; }
        @layer base {
          .button{ background: var(--bk-brand); color:white; border:0; padding:.7rem 1rem; border-radius:12px; }
        }
      </style>
      <button class="button" part="button">Book</button>
    `;
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
  - Require `@layer components` in component CSS files.
- **Build checks:** fail if runtime CSS-in-JS packages are imported in components (allow-list exceptions).
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
Source tokens live in `tokens/source/tokens.json` using the W3C draft design tokens structure. Run `pnpm tokens:build` to generate `dist/tokens.css`, `dist/tokens.d.ts`, and `dist/tokens.json`. The CSS file exposes custom properties for light and dark themes; toggling `[data-theme="dark"]` on the page swaps the values.
Use `--watch` to rebuild automatically when editing tokens:

```bash
pnpm tokens:build -- --watch
```

---


## CLI

Capsule provides a small command line interface in `packages/capsule-cli`.

### Local development

```bash
cd packages/capsule-cli
pnpm install
pnpm link # exposes a global `capsule` command
```

### Usage

```bash
capsule new component Button  # scaffolds a new component skeleton
capsule tokens build          # runs the token pipeline (pnpm run tokens:build)
capsule check                 # runs lint tasks (pnpm run lint)
```
