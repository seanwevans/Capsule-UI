# stylelint-config-capsule

Shared Stylelint configuration for Capsule UI projects. It enables the `capsule-ui/require-layer` rule to ensure every stylesheet declares an allowed `@layer` at the root.

## Usage

Install Stylelint and this config package:

```sh
pnpm add -D stylelint stylelint-config-capsule
```

Create a `.stylelintrc.json`:

```json
{
  "extends": ["stylelint-config-capsule"]
}
```

By default the rule requires a `@layer components` declaration.

### Custom layer stacks

Projects can override the allowed layers by configuring the rule:

```json
{
  "extends": ["stylelint-config-capsule"],
  "rules": {
    "capsule-ui/require-layer": { "names": ["utilities", "components"] }
  }
}
```

### Examples

**Web Components**

```css
@layer components;
:host { display: block; }
```

**Framework components**

```css
@layer components;
.button { color: red; }
```
