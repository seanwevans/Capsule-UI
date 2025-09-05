# Security audit

A review of Capsule's custom elements and runtime helpers was conducted to ensure host pages cannot escape component sandboxes.

## Findings

- **Shadow DOM boundaries** – All components attach a Shadow DOM in their constructor using `this.attachShadow({ mode: 'open' })`. Host styles are scoped to `:host` and interaction happens through parts or attributes only.
- **CSS variable injection** – `ThemeManager` sanitizes variable names and values before injecting them into a style element, preventing malicious CSS from breaking out of the selector. The new `registerTheme` and `load` utilities reuse the same sanitization.
- **Event surfaces** – Components dispatch `CustomEvent` instances without `composed: true` unless explicitly needed. This keeps events within the Shadow DOM by default and avoids leaking details to the host page. Locale change notifications are dispatched on `window` intentionally.
- **No script escapes** – Components do not evaluate host-provided scripts. Attributes and properties are applied directly to DOM APIs with no string-to-code evaluation.

No vulnerabilities were discovered during this audit. Continued reviews are recommended as new features land.
