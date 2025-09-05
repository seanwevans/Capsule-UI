# Security Guidelines

Capsule UI components run inside Shadow DOM to encapsulate markup and styles. This isolation helps prevent style leakage but it does not replace defensive coding practices.

## Input and Attribute Validation

- Components only react to a known list of attributes. Unknown attributes are ignored.
- Slotted or light‑DOM content passed into components is sanitised to remove `<script>` elements and inline event handlers.
- When inserting HTML strings at runtime, use the exported `sanitizeHTML` or `sanitizeNode` helpers to clean untrusted content.

## Event Surfaces

Custom events emitted by components never evaluate string payloads. Consumers should always attach listeners using `addEventListener` rather than inline `on*` handlers, which are stripped during sanitisation.

## Content Security Policy

To minimise the risk of cross‑site scripting, configure a Content Security Policy similar to:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
```

Adjust the directives for your environment and add `img-src`, `font-src`, or `connect-src` as required. Using nonces or hashes for styles and scripts enables a stricter policy if inline code must be avoided.

## Further Review

For high assurance deployments, engage a security professional to audit the component library and host application.
