# `<caps-card>`

Simple surface container with adjustable padding via container queries.

## Usage

### Web Component

```html
<caps-card><p>Card body</p></caps-card>
<caps-card variant="outline"><p>No shadow</p></caps-card>
```

### CSS Modules

```html
<div class="card"><p>Card body</p></div>
<div class="card" data-variant="outline"><p>No shadow</p></div>
```

Import `card.module.css` and apply the exported `card` class.

## Style API

- **CSS vars**: `--caps-card-bg`, `--caps-card-border`, `--caps-card-radius`, `--caps-card-padding`, `--caps-card-shadow`
- **Parts**: `card`
- **Attributes**: `variant`

Padding scales up when the card's container is `600px` or wider.

## Demo

<iframe src="https://storybook.capsule-ui.com/iframe.html?id=components-card--default" style="width:100%;height:400px;border:1px solid #eee;"></iframe>

## A11y

- Presents content as a generic container; ensure inner elements convey semantics.
