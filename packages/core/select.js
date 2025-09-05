import { instrumentComponent } from './instrument.js';
import { sanitizeNode } from './sanitize.js';

class CapsSelect extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'multiple', 'name', 'size', 'value', 'aria-label', 'aria-describedby', 'role'];
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
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text);
          transition: border-color var(--motion-fast);
        }
        :host([variant="outline"]) select { background: transparent; }
        @container (min-width: 480px) {
          select { padding: var(--spacing-md) var(--spacing-lg); }
        }
        select:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          :host { --motion-fast: 0s; }
        }
        @media (prefers-contrast: more) {
          select {
            border: 1px solid var(--color-text);
            background: var(--color-background);
            color: var(--color-text);
          }
        }
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
      select.setAttribute('aria-disabled', value !== null ? 'true' : 'false');
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
    } else if (name.startsWith('aria-') || name === 'role') {
      if (value !== null) select.setAttribute(name, value);
      else select.removeAttribute(name);
    }
  }

  #syncOptions() {
    const select = this.shadowRoot.querySelector('select');
    const slot = this.shadowRoot.querySelector('slot');
    if (!select || !slot) return;
    select.innerHTML = '';
    for (const node of slot.assignedNodes()) {
      if (node.nodeName === 'OPTION' || node.nodeName === 'OPTGROUP') {
        select.appendChild(sanitizeNode(node));
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

  focus() {
    this.shadowRoot.querySelector('select')?.focus();
  }
}

instrumentComponent('caps-select', CapsSelect);

if (!customElements.get('caps-select')) {
  customElements.define('caps-select', CapsSelect);
}

export { CapsSelect };
