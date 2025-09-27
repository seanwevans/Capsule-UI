import { instrumentComponent } from './instrument.js';
import { sanitizeNode } from './sanitize.js';

class CapsSelect extends HTMLElement {
  static formAssociated = true;

  #proxy;
  #internals;

  #onSelectChange = () => {
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;
    this.#reflectValue(select.value);
    this.#syncProxySelection();
    this.#syncInternals();
    this.dispatchEvent(new Event('change', { bubbles: true }));
  };

  static get observedAttributes() {
    return ['disabled', 'multiple', 'name', 'required', 'size', 'value', 'aria-label', 'aria-describedby', 'role'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#internals = this.attachInternals?.();
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
      <slot name="proxy" hidden></slot>
    `;
    this.#proxy = document.createElement('select');
    this.#proxy.setAttribute('slot', 'proxy');
    this.#proxy.setAttribute('aria-hidden', 'true');
    this.#proxy.hidden = true;
    this.#proxy.tabIndex = -1;
    this.shadowRoot.querySelector('select')?.addEventListener('change', this.#onSelectChange);
  }

  connectedCallback() {
    if (this.#proxy && !this.contains(this.#proxy)) {
      this.append(this.#proxy);
    }
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => this.#syncOptions());
    this.#syncOptions();
    this.#syncInternals();
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('select')?.removeEventListener('change', this.#onSelectChange);
  }

  attributeChangedCallback(name, _old, value) {
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;
    if (name === 'disabled') {
      select.toggleAttribute('disabled', value !== null);
      select.setAttribute('aria-disabled', value !== null ? 'true' : 'false');
      this.#proxy?.toggleAttribute('disabled', value !== null);
    } else if (name === 'multiple') {
      select.toggleAttribute('multiple', value !== null);
      this.#proxy?.toggleAttribute('multiple', value !== null);
    } else if (name === 'required') {
      select.toggleAttribute('required', value !== null);
      this.#proxy?.toggleAttribute('required', value !== null);
    } else if (name === 'size') {
      if (value !== null) select.setAttribute('size', value);
      else select.removeAttribute('size');
      if (value !== null) this.#proxy?.setAttribute('size', value);
      else this.#proxy?.removeAttribute('size');
    } else if (name === 'name') {
      if (value !== null) select.setAttribute('name', value);
      else select.removeAttribute('name');
      if (value !== null) this.#proxy?.setAttribute('name', value);
      else this.#proxy?.removeAttribute('name');
    } else if (name === 'value') {
      select.value = value ?? '';
      if (this.#proxy) {
        if (select.multiple) {
          this.#syncProxySelection();
        } else {
          this.#proxy.value = value ?? '';
        }
      }
    } else if (name.startsWith('aria-') || name === 'role') {
      if (value !== null) select.setAttribute(name, value);
      else select.removeAttribute(name);
    }
    if (['disabled', 'required', 'value'].includes(name)) {
      this.#syncInternals();
    }
  }

  #syncOptions() {
    const select = this.shadowRoot.querySelector('select');
    const slot = this.shadowRoot.querySelector('slot');
    if (this.#proxy && !this.contains(this.#proxy)) {
      this.append(this.#proxy);
    }
    if (!select || !slot) return;
    select.innerHTML = '';
    if (this.#proxy) this.#proxy.innerHTML = '';
    for (const node of slot.assignedNodes()) {
      if (node.nodeName === 'OPTION' || node.nodeName === 'OPTGROUP') {
        const sanitized = sanitizeNode(node.cloneNode(true));
        select.appendChild(sanitized);
        this.#proxy?.appendChild(sanitized.cloneNode(true));
      }
    }
    if (this.hasAttribute('value')) {
      select.value = this.getAttribute('value');
      if (this.#proxy) {
        if (select.multiple) {
          this.#syncProxySelection();
        } else {
          this.#proxy.value = this.getAttribute('value') ?? '';
        }
      }
    } else if (this.#proxy) {
      if (select.multiple) {
        this.#syncProxySelection();
      } else {
        this.#proxy.value = select.value ?? '';
      }
    }
    this.#syncInternals();
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get required() {
    return this.hasAttribute('required');
  }

  set required(val) {
    this.toggleAttribute('required', Boolean(val));
  }

  get value() {
    const select = this.shadowRoot.querySelector('select');
    return select?.value || '';
  }

  set value(v) {
    const value = v == null ? '' : String(v);
    this.#reflectValue(value);
  }

  formResetCallback() {
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;
    if (this.hasAttribute('value')) {
      select.value = this.getAttribute('value') ?? '';
    } else {
      select.selectedIndex = 0;
    }
    this.#syncProxySelection();
    this.#reflectValue(select.value);
    this.#syncInternals();
  }

  focus() {
    this.shadowRoot.querySelector('select')?.focus();
  }

  #reflectValue(value) {
    if (value) {
      if (this.getAttribute('value') !== value) {
        this.setAttribute('value', value);
      }
    } else if (this.hasAttribute('value')) {
      this.removeAttribute('value');
    }
    if (this.#proxy) {
      if (this.shadowRoot.querySelector('select')?.multiple) {
        this.#syncProxySelection();
      } else {
        this.#proxy.value = value ?? '';
      }
    }
  }

  #syncInternals() {
    if (!this.#internals) return;
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;
    const isDisabled = this.disabled;
    if (isDisabled) {
      this.#internals.setFormValue?.(null);
      this.#internals.setValidity?.({});
      this.#internals.states?.add('disabled');
      return;
    }
    this.#internals.states?.delete('disabled');
    const value = select.value ?? '';
    this.#internals.setFormValue?.(value === '' ? null : value);
    if (select.checkValidity()) {
      this.#internals.setValidity?.({});
    } else {
      const validity = select.validity;
      const state = {};
      if (validity.valueMissing) state.valueMissing = true;
      this.#internals.setValidity?.(state, select.validationMessage, select);
    }
  }

  #syncProxySelection() {
    const select = this.shadowRoot.querySelector('select');
    if (!select || !this.#proxy) return;
    if (select.multiple) {
      const selectedValues = new Set([...select.selectedOptions].map((opt) => opt.value));
      for (const option of this.#proxy.options) {
        option.selected = selectedValues.has(option.value);
      }
    } else {
      this.#proxy.value = select.value ?? '';
    }
  }
}

instrumentComponent('caps-select', CapsSelect);

if (!customElements.get('caps-select')) {
  customElements.define('caps-select', CapsSelect);
}

export { CapsSelect };
