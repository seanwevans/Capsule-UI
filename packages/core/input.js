import { getLocale, onLocaleChange } from './locale.js';

class CapsInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @layer components;
        :host { display: inline-block; }
        input {
          font: inherit;
          padding: var(--spacing-md) var(--spacing-lg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-background);
          color: var(--color-text);
        }
        input:focus-visible { outline: var(--spacing-xs) solid var(--color-brand); outline-offset: var(--spacing-xs); }
      </style>
      <input part="input" />
    `;
  }

  static get observedAttributes() {
    return ['value', 'type', 'placeholder', 'disabled', 'aria-label', 'aria-describedby', 'role'];
  }

  attributeChangedCallback(name, _old, value) {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return;
    if (name === 'disabled') {
      if (value !== null) {
        input.setAttribute('disabled', '');
        input.setAttribute('aria-disabled', 'true');
      } else {
        input.removeAttribute('disabled');
        input.removeAttribute('aria-disabled');
      }
    } else if (name === 'value') {
      if (value !== null) {
        input.setAttribute('value', value);
        input.value = value;
      } else {
        input.removeAttribute('value');
        input.value = '';
      }
    } else if (name.startsWith('aria-') || name === 'role' || name === 'placeholder' || name === 'type') {
      if (value !== null) input.setAttribute(name, value);
      else input.removeAttribute(name);
    }
  }

  connectedCallback() {
    if (!this.hasAttribute('dir')) {
      this.setAttribute('dir', getLocale().dir);
      this._unsub = onLocaleChange((loc) => {
        if (!this.hasAttribute('dir')) this.setAttribute('dir', loc.dir);
      });
    }
  }

  disconnectedCallback() {
    this._unsub?.();
  }

  focus() {
    this.shadowRoot.querySelector('input')?.focus();
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
