# `<caps-modal>`

Modal dialog that can expand to fullscreen and resizes based on container.

## Usage

### Web Component

```html
<caps-modal id="m">
  <p>Hi</p>
</caps-modal>
<caps-button onclick="m.setAttribute('open','')">Open</caps-button>
```

### CSS Modules

```html
<div class="container" id="m">
  <div class="backdrop"></div>
  <div class="modal">Hi</div>
</div>
<caps-button onclick="m.setAttribute('open','')">Open</caps-button>
```

Import `modal.module.css` and apply the exported classes `container`, `backdrop` and `modal`.

## Style API

- **CSS vars**: `--caps-modal-bg`
- **Parts**: `backdrop`, `modal`
- **Attributes**: `open`, `variant`

Setting `variant="fullscreen"` makes the dialog cover the viewport. The modal's minimum width grows when the container is wider than `600px`.

## A11y

- Focus is trapped when open and returned to the trigger on close.
- Clicking the backdrop or pressing `Escape` closes the dialog.
- Example:

```html
<caps-modal aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm</h2>
  <p>Are you sure?</p>
</caps-modal>
```

- Use `Tab`/`Shift+Tab` to cycle focus within the dialog.
