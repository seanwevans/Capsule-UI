customElements.define("booking-widget", class extends HTMLElement {
  constructor() {
    super();
    const r = this.attachShadow({ mode: "open" });
    r.innerHTML = `
      <style>
        @layer reset, base, components;
        :host {
          --bk-brand: var(--color-brand);
          --bk-text: var(--color-text);
          container-type: inline-size;
          display: block;
          color: var(--bk-text);
        }
        :host([theme="dark"]) {
          --bk-text: var(--color-text);
        }
        @layer base {
          .card {
            padding: 1rem;
            border: 1px solid var(--bk-brand);
            border-radius: 16px;
          }
          .button {
            background: var(--bk-brand);
            color: white;
            border: 0;
            padding: .7rem 1rem;
            border-radius: 12px;
            cursor: pointer;
          }
        }
      </style>
      <div class="card" part="card">
        <button class="button" part="button">Book</button>
      </div>
    `;
  }
});
