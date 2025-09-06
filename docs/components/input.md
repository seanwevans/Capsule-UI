# `<caps-input>`

Text input with themable styling and container-query padding adjustments.

## Usage

### Web Component

```html
<caps-input placeholder="Your name"></caps-input>
<caps-input variant="outline"></caps-input>
```

### CSS Modules

```html
<input class="input" placeholder="Your name" />
<input class="input" data-variant="outline" />
```

Import `input.module.css` and apply the exported `input` class.

## Style API

- **CSS vars**: `--caps-input-border`, `--caps-input-bg`, `--caps-input-color`
- **Parts**: `input`
- **Attributes**: `type`, `placeholder`, `disabled`, `value`, `variant`

Padding increases when its container width reaches `480px`.

## Demo

<iframe src="https://storybook.capsule-ui.com/iframe.html?id=components-input--default" style="width:100%;height:400px;border:1px solid #eee;"></iframe>

## A11y

- Pair with a `<label for="...">` to provide a programmatic name.
- Focus outline follows platform defaults.
- Example:

```html
<label for="email">Email</label>
<caps-input id="email"></caps-input>
```

- Move focus with `Tab`/`Shift+Tab` like a native `<input>`.
