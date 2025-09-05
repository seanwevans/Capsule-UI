class CapsInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        input {
          font: inherit;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--caps-input-border, #d1d5db);
          border-radius: 0.375rem;
          background: var(--caps-input-bg, #fff);
          color: var(--caps-input-color, #0f172a);
        }
        input:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
      </style>
      <input part="input" />
    `;
  }

  static get observedAttributes() { return ['value', 'type', 'placeholder', 'disabled']; }

  attributeChangedCallback(name, _old, value) {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return;
    if (name === 'disabled') {
      if (value !== null) input.setAttribute('disabled', '');
      else input.removeAttribute('disabled');
    } else if (name === 'value') {
      if (value !== null) {
        input.setAttribute('value', value);
        input.value = value;
      } else {
        input.removeAttribute('value');
        input.value = '';
      }

    } else {
      if (value !== null) input.setAttribute(name, value);
      else input.removeAttribute(name);
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get value() {
    const input = this.shadowRoot.querySelector('input');
    return input?.value || '';
  }

  set value(v) {
    const input = this.shadowRoot.querySelector('input');
    if (input) input.value = v;
  }
}

if (!customElements.get('caps-input')) {
  customElements.define('caps-input', CapsInput);
}

export { CapsInput };
