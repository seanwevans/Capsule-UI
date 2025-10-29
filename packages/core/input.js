import { withLocaleDir } from './withLocaleDir.js';
import { instrumentComponent } from './instrument.js';

class CapsInput extends withLocaleDir(HTMLElement) {
  static formAssociated = true;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          container-type: inline-size;
        }
        input {
          font: inherit;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text);
          transition: border-color var(--motion-fast);
        }
        :host([variant="outline"]) input { background: transparent; }
        @container (min-width: 480px) {
          input { padding: var(--spacing-md) var(--spacing-lg); }
        }
        input:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          :host { --motion-fast: 0s; }
        }
        @media (prefers-contrast: more) {
          input {
            border-color: var(--color-text);
            background: var(--color-background);
            color: var(--color-text);
          }
        }
      </style>
      <input part="input" />
    `;

    this._input = this.shadowRoot.querySelector('input');
    this._handleValueChange = () => {
      if (!this._input) return;
      const nextValue = this._input.value ?? '';
      this._syncFormValue(nextValue);
    };

    if (this._input) {
      this._input.addEventListener('input', this._handleValueChange);
      this._input.addEventListener('change', this._handleValueChange);
    }

    this._internals = null;
    this._formProxy = null;
    if (typeof this.attachInternals === 'function') {
      const internals = this.attachInternals();
      if (internals && typeof internals.setFormValue === 'function') {
        this._internals = internals;
      }
    }

    if (!this._internals) {
      this._formProxy = document.createElement('input');
      this._formProxy.type = 'hidden';
      this._formProxy.setAttribute('aria-hidden', 'true');
      this._formProxy.tabIndex = -1;
      this._formProxy.hidden = true;
    }

    this._syncFormName(this.getAttribute('name'));
    this._syncFormValue(this.getAttribute('value'));
    this._syncFormDisabled(this.hasAttribute('disabled'));
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this._formProxy && !this.contains(this._formProxy)) {
      this.append(this._formProxy);
    }
  }

  static get observedAttributes() {
    return ['value', 'type', 'placeholder', 'disabled', 'aria-label', 'aria-describedby', 'role', 'name'];
  }

  attributeChangedCallback(name, _old, value) {
    const input = this._input;
    if (!input) return;
    if (name === 'disabled') {
      if (value !== null) {
        input.setAttribute('disabled', '');
        input.setAttribute('aria-disabled', 'true');
      } else {
        input.removeAttribute('disabled');
        input.removeAttribute('aria-disabled');
      }
      this._syncFormDisabled(value !== null);
    } else if (name === 'value') {
      if (value !== null) {
        input.setAttribute('value', value);
        input.value = value;
      } else {
        input.removeAttribute('value');
        input.value = '';
      }
      this._syncFormValue(value);
    } else if (
      name.startsWith('aria-') ||
      name === 'role' ||
      name === 'placeholder' ||
      name === 'type' ||
      name === 'name'
    ) {
      if (value !== null) input.setAttribute(name, value);
      else input.removeAttribute(name);
      if (name === 'name') {
        this._syncFormName(value);
      }
    }
  }

  focus() {
    this._input?.focus();
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get value() {
    return this._input?.value || '';
  }

  set value(v) {
    if (v !== undefined && v !== null) {
      const stringValue = typeof v === 'string' ? v : String(v);
      if (stringValue !== '') {
        this.setAttribute('value', stringValue);
      } else {
        this.removeAttribute('value');
      }
    } else {
      this.removeAttribute('value');
    }
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  set name(val) {
    if (val !== undefined && val !== null && val !== '') {
      this.setAttribute('name', val);
    } else {
      this.removeAttribute('name');
    }
  }

  _syncFormValue(value) {
    const nextValue = value ?? '';
    const stringValue = typeof nextValue === 'string' ? nextValue : String(nextValue);
    if (this._internals) {
      this._internals.setFormValue(stringValue);
    } else if (this._formProxy) {
      this._formProxy.value = stringValue;
    }
  }

  _syncFormName(name) {
    if (this._formProxy) {
      if (name) {
        this._formProxy.setAttribute('name', name);
      } else {
        this._formProxy.removeAttribute('name');
      }
    }
  }

  _syncFormDisabled(isDisabled) {
    if (this._formProxy) {
      this._formProxy.disabled = Boolean(isDisabled);
    } else if (this._internals && this._internals.states) {
      if (isDisabled) {
        this._internals.states.add('disabled');
      } else {
        this._internals.states.delete('disabled');
      }
    }
  }
}

instrumentComponent('caps-input', CapsInput);

if (!customElements.get('caps-input')) {
  customElements.define('caps-input', CapsInput);
}

export { CapsInput };
