# `<caps-tabs>`

Tabbed interface that switches orientation based on container width.

## Usage

### Web Component

```html
<caps-tabs>
  <button slot="tab">One</button>
  <button slot="tab">Two</button>
  <div slot="panel">First panel</div>
  <div slot="panel">Second panel</div>
</caps-tabs>
```

### CSS Modules

```html
<div class="tabs">
  <div class="tablist" role="tablist">
    <button class="tab" aria-selected="true">One</button>
    <button class="tab">Two</button>
  </div>
  <div class="panels">
    <div class="panel" data-active>First panel</div>
    <div class="panel">Second panel</div>
  </div>
</div>
```

Import `tabs.module.css` and apply the exported classes.

## Style API

- **CSS vars**: `--caps-tab-bg`, `--caps-tab-active-bg`, `--caps-tab-border`
- **Parts**: `tablist`, `panels`
- **Attributes**: `variant`

When the container is narrower than `480px` the tab list stacks vertically.

## Demo

<iframe src="https://storybook.capsule-ui.com/iframe.html?id=components-tabs--default" style="width:100%;height:400px;border:1px solid #eee;"></iframe>

## A11y

- Tab buttons are given proper `role` and keyboard navigation.
- Remember to label the tab list if necessary via `aria-label`.
