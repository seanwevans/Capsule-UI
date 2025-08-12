# Capsule UI — Roadmap

A living plan toward v1.0. We prioritize stability, clear contracts, and great DX for embeddable, white‑label components.

---

## Milestone 0 — Seed (Now)
- ✅ Public docs: README, Roadmap, Style Contract ADR template.
- ✅ Example component: `<booking-widget>` (Shadow DOM) showing tokens, parts, container queries.
- ✅ CSS Modules variant of the example for app integration.

**Exit criteria:** One demo component in both flavors, documented Style API, theming works at runtime.

---

## Milestone 1 — Tokens Pipeline
- Source tokens in JSON (W3C draft shape).
- Codegen to:
  - `tokens.css` (CSS vars per theme)
  - `tokens.d.ts` (TypeScript types)
  - `tokens.json` (runtime lookup for docs)
- Starter light/dark/brand themes; `data-theme="*"` swapping.

**Exit criteria:** Any component can consume tokens without hand-writing vars.

---

## Milestone 2 — Component Recipes (Variants)
- Adopt CVA/stylex/Panda/UnoCSS (compiled) for variant recipes.
- Pattern: props → classes; zero runtime CSS generation.
- Lint rule to forbid ad‑hoc class soup in callsites; enforce recipes.

**Exit criteria:** All components expose typed variant APIs with autocomplete.

---

## Milestone 3 — Governance & CI
- stylelint config (tokens-only, max-specificity, no `!important` outside overrides).
- eslint rules (ban runtime CSS-in-JS in components).
- ADR generator (`pnpm new:component`) scaffolds files with `@layer components` and Style API stubs.

**Exit criteria:** New PRs can’t violate the style contract.

---

## Milestone 4 — Adapters
- **React**, **Vue**, **Svelte** wrappers around Web Components (thin, no styling logic).
- Provide CSS Modules equivalents for app-internal use.

**Exit criteria:** One-liners to consume Capsule in popular frameworks.

---

## Milestone 5 — SSR & SEO
- Guidance + examples:
  - Web Components hydration with light-DOM fallbacks.
  - Framework SSR for CSS Modules flavor.
- Playwright tests for hydration correctness and CLS.

**Exit criteria:** Docs and examples cover SSR paths with passing integration tests.

---

## Milestone 6 — A11y & i18n Baseline
- Checklist: focus rings, keyboard traps, ARIA roles/labels, reduced motion, contrast.
- Directionality (LTR/RTL) and locale-aware number/date formatting hooks.
- Axe/Pa11y integration in CI.

**Exit criteria:** Components meet a11y minimums; CI enforces regressions.

---

## Milestone 7 — Visual Regression & Theming Lab
- Storybook: theme × density × locale matrix.
- Chromatic/Playwright VRT.
- “Theming Lab” playground that edits CSS vars live and exports a theme preset.

**Exit criteria:** Teams can preview + lock in tenant themes with confidence.

---

## Milestone 8 — Core Library (v0.x)
- Button, Input, Select, Tabs, Card, Modal built with Capsule patterns.
- Container-query examples in each.
- Per-component Style API docs (vars/parts/attributes).

**Exit criteria:** Usable starter library for typical SaaS embeds.

---

## Milestone 9 — Tooling
- `capsule-cli`:
  - `capsule new component <Name>` — scaffold with tests and docs.
  - `capsule check` — run contract lint/CI locally.
  - `capsule tokens build` — regenerate CSS/TS from token sources.
- VS Code snippets for parts/vars IntelliSense.

**Exit criteria:** Smooth DX from day 1; fewer footguns.

---

## Milestone 10 — Performance Pass
- Bundle size budgets and CI gates.
- Measure/layout profiling of complex components.
- Prefer `content-visibility`, `contain`, and no forced reflow patterns.

**Exit criteria:** P95 interaction metric targets documented and enforced.

---

## Milestone 11 — Enterprise Features
- Multi-tenant theming presets and runtime switching examples.
- Hardening for microfrontends and webviews.
- Security review of custom element boundaries and event surfaces.

**Exit criteria:** Confident embed story for partner/marketplace scenarios.

---

## v1.0 Release Criteria
- Stable token pipeline, adapters, and Style API conventions.
- Core component set complete and documented.
- CI green across lint, unit, a11y, VRT, perf budgets.
- Migration guide from common stacks (Tailwind, CSS-in-JS).

---

## Nice-to-haves (post‑v1)
- Design tokens ↔ Figma plugin sync.
- Theme package registry and shareable URLs.
- Codemods for adopting Capsule in existing projects.
