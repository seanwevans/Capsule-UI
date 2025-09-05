class CapsSelect extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'multiple', 'name', 'size', 'value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @layer components;
        :host { display: inline-block; }
        select {
          font: inherit;
          padding: var(--spacing-md) var(--spacing-lg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-background);
          color: var(--color-text);
        }
        select:focus-visible { outline: var(--spacing-xs) solid var(--color-brand); outline-offset: var(--spacing-xs); }
      </style>
      <select part="select"></select>
      <slot hidden></slot>
    `;
  }

  connectedCallback() {
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => this.#syncOptions());
    this.#syncOptions();
  }

  attributeChangedCallback(name, _old, value) {
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;
    if (name === 'disabled') {
      select.toggleAttribute('disabled', value !== null);
    } else if (name === 'multiple') {
      select.toggleAttribute('multiple', value !== null);
    } else if (name === 'size') {
      if (value !== null) select.setAttribute('size', value);
      else select.removeAttribute('size');
    } else if (name === 'name') {
      if (value !== null) select.setAttribute('name', value);
      else select.removeAttribute('name');
    } else if (name === 'value') {
      select.value = value ?? '';
    }
  }

  #syncOptions() {
    const select = this.shadowRoot.querySelector('select');
    const slot = this.shadowRoot.querySelector('slot');
    if (!select || !slot) return;
    select.innerHTML = '';
    for (const node of slot.assignedNodes()) {
      if (node.nodeName === 'OPTION' || node.nodeName === 'OPTGROUP') {
        select.appendChild(node);
      }
    }
    if (this.hasAttribute('value')) {
      select.value = this.getAttribute('value');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get value() {
    const select = this.shadowRoot.querySelector('select');
    return select?.value || '';
  }

  set value(v) {
    const select = this.shadowRoot.querySelector('select');
    if (select) select.value = v;
  }
}

if (!customElements.get('caps-select')) {
  customElements.define('caps-select', CapsSelect);
}

export { CapsSelect };
