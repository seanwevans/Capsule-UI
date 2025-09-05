class CapsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        @layer components;
        :host { display: block; }
        .card {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
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
