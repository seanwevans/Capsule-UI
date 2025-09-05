class CapsSelect extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'multiple', 'name', 'size', 'value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          container-type: inline-size;
        }
        select {
          font: inherit;
          padding: var(--caps-select-padding, 0.5rem 0.75rem);
          border: var(--caps-select-border, 1px solid #d1d5db);
          border-radius: var(--caps-select-radius, 0.375rem);
          background: var(--caps-select-bg, #fff);
          color: var(--caps-select-color, #0f172a);
        }
        :host([variant="outline"]) select { background: transparent; }
        @container (min-width: 480px) {
          select { padding: 0.75rem 1rem; }
        }
        select:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
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
