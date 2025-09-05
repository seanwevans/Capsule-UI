# Architecture Decision Records

This directory houses ADRs for Capsule.

To create a new component with an accompanying ADR run:

```
pnpm new:component <Name>
```

The generator copies the [style contract template](000-style-contract-template.md) and scaffolds component files under `packages/core`.

To manually create an ADR:

1. Copy the template to a new file with the next number, e.g. `001-your-decision.md`.
2. Update the title, fill in the sections, and set the initial status.
3. Commit the file and reference it from discussions or pull requests.
