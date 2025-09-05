class CapsButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        button {
          font: inherit;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          background: var(--caps-btn-bg, #4f46e5);
          color: var(--caps-btn-color, #fff);
        }
        button:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
        button[disabled] { opacity: 0.6; cursor: not-allowed; }
      </style>
      <button part="button" type="button"><slot></slot></button>
    `;
  }

  static get observedAttributes() { return ['disabled', 'type']; }

  attributeChangedCallback(name, _old, value) {
    const btn = this.shadowRoot.querySelector('button');
    if (!btn) return;
    if (name === 'disabled') {
      if (value !== null) btn.setAttribute('disabled', '');
      else btn.removeAttribute('disabled');
    }
    if (name === 'type') {
      btn.setAttribute('type', value || 'button');
    }
  }
}

if (!customElements.get('caps-button')) {
  customElements.define('caps-button', CapsButton);
}

export { CapsButton };
