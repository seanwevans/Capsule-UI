# ADR 000: Style Contract Template

## Status
Draft

## Context
Explain why this style decision is needed and what problem it addresses.

## Decision
### Scope by default
Describe how component styles are isolated (e.g., Shadow DOM, CSS Modules) and why this approach is chosen.

### Token usage
List the design tokens exposed as CSS custom properties and reference them instead of hard-coded values.

### Layer ordering
Detail how the component participates in the shared `@layer` stack and the expected order of styles.

### Variant strategy
Explain how variants map to CSS classes or attributes and whether they compile at build time.

## Consequences
Note any trade-offs, follow-up work, or implications of this decision.
