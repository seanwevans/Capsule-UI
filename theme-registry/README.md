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
