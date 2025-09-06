# Theming guidelines

Capsule UI components read design tokens via CSS custom properties.
Override tokens at the root or per component to align with your brand.
Keep overrides small and document the intent.

## Tokens

- Use semantic token names like `color.brand` rather than hex values.
- Scope overrides to the smallest region that needs them.
- Prefer theme toggles (light/dark) over one-off overrides.

## Presets and sharing

Use the [theming lab](theming-lab) to experiment with tokens and export
JSON presets. Store presets in version control or upload them to the
[theme registry](theme-registry.md) for sharing across teams.

## Testing themes

Run visual regression tests for each preset to ensure components render
as expected. Combine with accessibility checks to confirm contrast and
focus states remain compliant.
