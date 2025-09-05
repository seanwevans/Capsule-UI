# `<caps-card>`

Simple surface container with adjustable padding via container queries.

## Usage

### Web Component

```html
<caps-card>Content</caps-card>
<caps-card variant="outline">No shadow</caps-card>
```

### CSS Modules

```html
<div class="card">Content</div>
<div class="card" data-variant="outline">No shadow</div>
```

Import `card.module.css` and apply the exported `card` class.

## Style API

- **CSS vars**: `--caps-card-bg`, `--caps-card-border`, `--caps-card-radius`, `--caps-card-padding`, `--caps-card-shadow`
- **Parts**: `card`
- **Attributes**: `variant`

Padding scales up when the card's container is `600px` or wider.

## A11y

- Presents content as a generic container; ensure inner elements convey semantics.
