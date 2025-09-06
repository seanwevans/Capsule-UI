# Multi-tenant design

Capsule UI can serve multiple tenants from a single deployment. Keep
styles, data and metrics isolated so tenants cannot affect each other.

## Theme isolation

- Provide a token preset per tenant and load it with `setTheme`.
- Mount each tenant's UI in a Shadow DOM root to prevent style leaks.

## Configuration

- Fetch tenant configuration at runtime instead of bundling it.
- Avoid caching sensitive tenant data in shared storage.

## Metrics and errors

Tag analytics and error reports with a tenant identifier using the
hooks described in [analytics-error-reporting.md](analytics-error-reporting.md).
Store logs separately if regulations require data separation.

## Testing

Run unit, accessibility and visual tests for every tenant preset to
ensure consistent behaviour across configurations.
