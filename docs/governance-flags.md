# Governance Flags

Capsule enforces a strict style contract through lint and build checks. Two environment flags act as escape hatches when that contract needs to bend:

## `CAPSULE_LAYER_NAMES`
Use this to override the required `@layer components` name or to supply additional layer names (e.g. `utilities,components`). Consider it when:

- Integrating legacy CSS that already uses different layer names.
- Building a utilities layer that must precede `components`.
- Prototyping before a shared layer order is finalized.

**Trade-offs:** Diverging layer names can fragment the contract and make components behave differently across teams. Misordered layers may hide bugs or allow unintended overrides.

**Consistency tips:** document the chosen layer order in an ADR, share configuration across repos, and review custom layer names in code review.

## `CAPSULE_ALLOW_RUNTIME_STYLES`
Setting this flag allows runtime CSS-in-JS imports that Capsule normally blocks. Use it only when:

- Styles must react to data that cannot be expressed with design tokens.
- A third-party library injects styles at runtime.
- Performing a temporary migration away from an existing CSS-in-JS solution.

**Trade-offs:** runtime styling increases bundle size, skips static analysis, and can erode token discipline. Overuse leads to unpredictable styling and harder debugging.

**Consistency tips:** require an ADR for each exception, scope dynamic styles to leaf components, and track these usages for eventual removal.

---

Bending Capsule's contract should be rare and deliberate. When these flags are used, capture the rationale, plan a path back to the default, and communicate decisions so teams stay aligned.
