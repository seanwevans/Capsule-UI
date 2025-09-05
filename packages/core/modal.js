class CapsModal extends HTMLElement {
  static get observedAttributes() { return ['open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: none; position: fixed; inset: 0; }
        :host([open]) { display: block; }
        .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
        .modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--caps-modal-bg, #fff); padding: 1rem; border-radius: 0.5rem; min-width: 300px; }
      </style>
      <div class="backdrop" part="backdrop"></div>
      <div class="modal" part="modal"><slot></slot></div>
    `;
  }

  connectedCallback() {
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    backdrop?.addEventListener('click', () => this.removeAttribute('open'));
  }

  attributeChangedCallback() {
    // styles handle visibility
  }
}

if (!customElements.get('caps-modal')) {
  customElements.define('caps-modal', CapsModal);
}

export { CapsModal };
