# Theme registry service

Minimal file-based service for sharing Capsule UI theme tokens.

## Usage

Start the server:

```bash
node theme-registry/server.mjs
```

### Upload a theme

```
curl -X POST http://localhost:8080/themes \
  -H 'Content-Type: application/json' \
  -d '{"slug":"acme","tokens":{"color":{"brand":"#ff3b3b"}}}'
```

### List themes

```
curl http://localhost:8080/themes
```

### Fetch a theme

```
curl http://localhost:8080/themes/acme
```

Theme files are stored in `theme-registry/themes/<slug>.json` and can
be consumed at runtime via their URL.

## Authentication

Set a `THEME_REGISTRY_TOKEN` environment variable to require a bearer
token for `POST /themes` requests:

```bash
THEME_REGISTRY_TOKEN=secret node theme-registry/server.mjs
```

Then include the token when uploading themes:

```bash
curl -X POST http://localhost:8080/themes \
  -H 'Authorization: Bearer secret' \
  -H 'Content-Type: application/json' \
  -d '{"slug":"acme","tokens":{"color":{"brand":"#ff3b3b"}}}'
```

## CDN integration

If your themes are mirrored to a CDN, set `THEME_REGISTRY_BASE_URL` to
the CDN origin so theme URLs returned by the service point there:

```bash
THEME_REGISTRY_BASE_URL=https://cdn.example.com/capsule \
  node theme-registry/server.mjs
```

## Consuming themes

Use the `registry-theme-loader` script to fetch a theme from the
registry and register it with the `ThemeManager` API:

```bash
node scripts/registry-theme-loader.mjs <tenant> <theme-slug> <registry-url>
```
