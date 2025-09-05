class BookingWidget extends HTMLElement {
  static get observedAttributes() {
    return ["theme", "variant", "density"];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        @layer reset, base, components, overrides;

        :host {
          /* Defaults (page can override these at runtime) */
          --bk-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          --bk-bg: #f7f7fb;
          --bk-surface: #ffffff;
          --bk-text: #0f172a;
          --bk-muted: #64748b;
          --bk-brand: #4f46e5;           /* indigo */
          --bk-brand-text: #ffffff;
          --bk-radius: 16px;
          --bk-gap: .75rem;
          --bk-pad: 1rem;
          --bk-shadow: 0 8px 30px rgba(2, 6, 23, .08);
          --bk-border: 1px solid rgba(2, 6, 23, .08);

          display: block;
          font: 400 14px/1.45 var(--bk-font);
          color: var(--bk-text);
          /* Container queries: descendants can adapt to host width */
          container-type: inline-size;
        }

        :host([theme="dark"]) {
          --bk-bg: #0b0d13;
          --bk-surface: #12141b;
          --bk-text: #e6e8ef;
          --bk-muted: #98a2b3;
          --bk-shadow: 0 10px 36px rgba(0,0,0,.45);
          --bk-border: 1px solid rgba(255,255,255,.12);
        }

        :host([density="compact"]) {
          --bk-gap: .5rem;
          --bk-pad: .75rem;
          --bk-radius: 12px;
        }

        @layer reset {
          *,*::before,*::after { box-sizing: border-box; }
          button, input, select { font: inherit; color: inherit; }
          button { cursor: pointer; }
        }

        @layer base {
          .card {
            background: var(--bk-surface);
            border-radius: var(--bk-radius);
            padding: var(--bk-pad);
            box-shadow: var(--bk-shadow);
            border: var(--bk-border);
            display: grid;
            gap: var(--bk-gap);
          }

          .header {
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            gap: .75rem;
          }
          .title { font-size: 1rem; font-weight: 700; }
          .subtitle { color: var(--bk-muted); font-size: .875rem; }

          .form { display: grid; gap: var(--bk-gap); }
          .row { display: grid; gap: var(--bk-gap); grid-template-columns: 1fr; }
          @container (min-width: 420px) {
            .row { grid-template-columns: 1fr 1fr; }
          }

          .field { display: grid; gap: .35rem; }
          .label { font-size: .75rem; color: var(--bk-muted); }
          .input {
            appearance: none;
            border: 1px solid rgba(2, 6, 23, .15);
            background: transparent;
            color: inherit;
            border-radius: 12px;
            padding: .65rem .75rem;
          }
          :host([theme="dark"]) .input { border-color: rgba(255,255,255,.18); }

          .button {
            display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
            padding: .7rem 1rem; border-radius: 12px; border: 0;
            font-weight: 700;
            background: var(--bk-brand); color: var(--bk-brand-text);
          }
          .button:focus-visible { outline: 2px solid rgba(0,0,0,.2); outline-offset: 2px; }

          :host([variant="ghost"]) .button {
            background: transparent;
            color: var(--bk-brand);
            border: 1px solid currentColor;
          }
        }

        @layer components {
          /* expose parts for host customization */
          .card     { position: relative; }
        }
      </style>

      <div class="card" part="card">
        <div class="header" part="header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" opacity=".15"></rect>
            <path d="M3 9h18" stroke="currentColor" opacity=".25"></path>
            <circle cx="8.5" cy="13.5" r="1.25" fill="currentColor"></circle>
            <circle cx="12" cy="13.5" r="1.25" fill="currentColor" opacity=".6"></circle>
            <circle cx="15.5" cy="17" r="1.25" fill="currentColor"></circle>
          </svg>
          <div>
            <div class="title"   part="title">Book a slot</div>
            <div class="subtitle" part="subtitle">Pick a date, time & guests</div>
          </div>
        </div>

        <form class="form" part="form">
          <div class="row">
            <label class="field" part="field">
              <span class="label" part="label">Date</span>
              <input class="input" part="input date" type="date" name="date" required />
            </label>
            <label class="field" part="field">
              <span class="label" part="label">Time</span>
              <select class="input" part="input select" name="time" required>
                <option value="" disabled selected>Select…</option>
                <option>09:00</option><option>10:00</option><option>11:00</option>
                <option>13:00</option><option>14:00</option><option>15:00</option>
              </select>
            </label>
            <label class="field" part="field">
              <span class="label" part="label">Guests</span>
              <input class="input" part="input number" type="number" name="guests" min="1" max="12" value="2" />
            </label>
            <label class="field" part="field">
              <span class="label" part="label">Notes (optional)</span>
              <input class="input" part="input text" type="text" name="notes" placeholder="Allergies, requests…" />
            </label>
          </div>

          <button class="button" part="button" type="submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Book
          </button>
        </form>
      </div>
    `;
  }
  connectedCallback() {
    this.shadowRoot.querySelector("form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const detail = Object.fromEntries(fd.entries());
      this.dispatchEvent(new CustomEvent("book", {
        detail,
        bubbles: true
      }));
    });
  }
  attributeChangedCallback() {
    // No-op: CSS reacts to [theme], [variant], [density].
  }
}
customElements.define("booking-widget", BookingWidget);
