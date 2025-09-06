# `<caps-select>`

Styled select element exposing minimal Style API. Options are provided in light DOM and moved into the internal `<select>` for isolation.

## Usage

### Web Component

```html
<caps-select value="b">
  <option value="a">A</option>
  <option value="b">B</option>
</caps-select>
<caps-select variant="outline">
  <option value="a">A</option>
  <option value="b">B</option>
</caps-select>
```

### CSS Modules

```html
<select class="select">
  <option value="a">A</option>
  <option value="b">B</option>
</select>
<select class="select" data-variant="outline">
  <option value="a">A</option>
  <option value="b">B</option>
</select>
```

Import `select.module.css` and apply the exported `select` class.

## Style API

- **CSS vars**: `--caps-select-padding`, `--caps-select-border`, `--caps-select-radius`, `--caps-select-bg`, `--caps-select-color`
- **Parts**: `select`
- **Attributes**: `disabled`, `multiple`, `size`, `name`, `value`, `variant`

Padding adjusts when the container is at least `480px` wide.

## A11y

- Pair with a `<label for="...">` to provide a programmatic name.
- Uses native `<select>` semantics so keyboard and screen-reader behavior follow platform defaults.
- Example:

```html
<label for="fruit">Fruit</label>
<caps-select id="fruit">
  <option value="a">Apple</option>
  <option value="b">Banana</option>
</caps-select>
```

- Open the list with `Alt+Down` and navigate options with arrow keys.
