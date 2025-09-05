class CapsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          container-type: inline-size;
        }
        .card {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }
        :host([variant="outline"]) .card { box-shadow: none; }
        @container (min-width: 600px) {
          .card { padding: calc(var(--spacing-lg) * 1.5); }
        }
      </style>
      <div class="card" part="card"><slot></slot></div>
    `;
  }
}

if (!customElements.get('caps-card')) {
  customElements.define('caps-card', CapsCard);
}

export { CapsCard };
