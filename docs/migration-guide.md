# Migration guide

Capsule provides codemods to help move existing projects to the design system.
The codemods live in the `capsule-cli` package and are exposed through the
`migrate` command.

```
capsule migrate tailwind [paths]
capsule migrate emotion [paths]
```

## Tailwind / utility classes

The Tailwind codemod looks for button elements with utility classes such as
`className="btn btn-primary"` or `class="btn btn-primary"` in React, Vue and
Svelte files. These are replaced with `CapsButton` components and a `variant`
prop when a `btn-*` class is present. Imports for the correct framework
adapter are injected automatically.

**Manual follow‑ups**

- Dynamic class expressions are left untouched and should be migrated by hand.
- Only simple `btn` patterns are recognised; other utilities require manual
  conversion.

## Emotion / styled‑components

The Emotion codemod removes `styled.button` definitions (from Emotion or
styled‑components) and replaces their usages with `CapsButton` from
`@capsule-ui/react`. The variant is inferred from the variable name
(`PrimaryButton` → `variant="primary"`).

**Manual follow‑ups**

- Custom CSS beyond Capsule variants should be reviewed and moved to the
  appropriate Capsule API.
- Components other than `button` are currently ignored.

Run the codemods incrementally and verify the results. Commit the generated
changes and complete any manual steps described above.
