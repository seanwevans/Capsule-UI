# `<caps-button>`

Button element with encapsulated styles and responsive padding via container queries.

## Usage

### Web Component

```html
<caps-button>Save</caps-button>
<caps-button variant="outline">Cancel</caps-button>
```

### CSS Modules

```html
<button class="button">Save</button>
<button class="button" data-variant="outline">Cancel</button>
```

Import `button.module.css` and apply the exported `button` class.

## Style API

- **CSS vars**: `--caps-btn-bg`, `--caps-btn-color`
- **Parts**: `button`
- **Attributes**: `disabled`, `type`, `variant`

Container query: padding grows when the button's container is at least `480px` wide.

## Demo

<iframe src="https://storybook.capsule-ui.com/iframe.html?id=components-button--default" style="width:100%;height:400px;border:1px solid #eee;"></iframe>

## A11y

- Uses native `<button>` semantics so keyboard and screen-reader behaviour follow platform defaults.
- Set `aria-label` when the button has no text content.
- Example:

```html
<caps-button aria-label="Add item">
  <svg aria-hidden="true"><!-- icon --></svg>
</caps-button>
```

- Activate the button with `Enter` or `Space`.
