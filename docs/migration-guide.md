# Migration guide

Capsule provides codemods to help move existing projects to the design system.
The codemods live in the `capsule-cli` package and are exposed through the
`migrate` command.

```
capsule migrate tailwind [paths]
capsule migrate emotion [paths]
```

## Tailwind / utility classes

The Tailwind codemod looks for utility classes such as `btn`, `input`, `card`,
`tabs`, `modal` and `select` in React, Vue and Svelte files. It also understands
dynamic `className` expressions (`clsx`, template literals, conditional
expressions, etc.). Matching elements are replaced with the corresponding
`Caps*` component and a `variant` prop when a `*-foo` class is present. Imports
for the correct framework adapter are injected automatically.

**Manual follow‑ups**

- Highly dynamic class constructions may still require manual review.

## Emotion / styled‑components

The Emotion codemod removes `styled.button` definitions (from Emotion or
styled‑components) and replaces their usages with `CapsButton` from
`@capsule-ui/react`. The variant is inferred from the variable name
(`PrimaryButton` → `variant="primary"`).

**Manual follow‑ups**

- Custom CSS beyond Capsule variants should be reviewed and moved to the
  appropriate Capsule API.
- Components other than `button` are currently ignored.

## Other CSS‑in‑JS libraries

Projects using libraries such as **styled‑system** can migrate by replacing
style props with Capsule's style factories or utility props. Map any `variant`
or spacing props to the equivalent Capsule component props or CSS variables and
remove library‑specific helpers during the refactor.

## Bootstrap / Material UI

Popular component libraries can be migrated incrementally. Replace Bootstrap's
`btn`/`form-control` classes or Material UI components like `<Button>` and
`<TextField>` with their Capsule counterparts (`CapsButton`, `CapsInput`, etc.),
mapping colour or variant props as needed. Layout utilities should be moved to
Capsule tokens or components.

Run the codemods incrementally and verify the results. Commit the generated
changes and complete any manual steps described above.
