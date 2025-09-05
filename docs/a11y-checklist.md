# Component Accessibility Checklist

Every Capsule component must satisfy this checklist before merging:

- **Focus management** – visible focus ring and no keyboard traps.
- **Keyboard navigation** – all interactive elements operable via keyboard.
- **ARIA roles and labels** – correct semantics and `aria-*` attributes.
- **Reduced motion** – honor `prefers-reduced-motion` with CSS custom properties.
- **High contrast** – respect `prefers-contrast` and expose theme vars.
- **Directionality** – handle `dir` changes and flip interactions in RTL.
- **Locale formatting** – use locale‑aware date and number formatting helpers.

Run `pnpm run test:a11y` to execute Pa11y against examples and prevent regressions.
