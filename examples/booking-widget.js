/*
 * booking-widget.js
 *
 * Defines a custom element <booking-widget> that encapsulates a booking
 * form. The widget exposes a small Style API for theming via CSS
 * variables and attributes: theme, variant and density. It dispatches a
 * "book" event when the form is submitted with the form data.
 */

class BookingWidget extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'variant', 'density'];
  }

  constructor() {
    super();
    // Attach an open shadow root so host pages can use the ::part API.
    this.attachShadow({ mode: 'open' });
    // Build the widget's shadow DOM. Note that CSS variables defined on
    // the host element cascade into the shadow DOM and are used by the
    // styles below. The @layer directive establishes ordering between
    // layers – reset, base, components and overrides – similar to the
    // Capsule UI philosophy.
    this.shadowRoot.innerHTML = `
      <style>
        @layer reset, base, components, overrides;

        :host {
          /* Defaults (host page can override these at runtime) */
          --bk-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            'Helvetica Neue', Arial;
          --bk-bg: #f7f7fb;
          --bk-surface: #ffffff;
          --bk-text: #0f172a;
          --bk-muted: #64748b;
          --bk-brand: #4f46e5; /* indigo */
          --bk-brand-text: #ffffff;
          --bk-radius: 16px;
          --bk-gap: 0.75rem;
          --bk-pad: 1rem;
          --bk-shadow: 0 8px 30px rgba(2, 6, 23, 0.08);
          --bk-border: 1px solid rgba(2, 6, 23, 0.08);

          display: block;
          font: 400 14px/1.45 var(--bk-font);
          color: var(--bk-text);
          /* Container queries allow descendants to adapt to the host width */
          container-type: inline-size;
        }

        /* Dark theme overrides */
        :host([theme='dark']) {
          --bk-bg: #0b0d13;
          --bk-surface: #12141b;
          --bk-text: #e6e8ef;
          --bk-muted: #98a2b3;
          --bk-shadow: 0 10px 36px rgba(0, 0, 0, 0.45);
          --bk-border: 1px solid rgba(255, 255, 255, 0.12);
        }

        /* Compact density overrides */
        :host([density='compact']) {
          --bk-gap: 0.5rem;
          --bk-pad: 0.75rem;
          --bk-radius: 12px;
        }

        @layer reset {
          *, *::before, *::after {
            box-sizing: border-box;
          }
          button,
          input,
          select {
            font: inherit;
            color: inherit;
          }
          button {
            cursor: pointer;
          }
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
            gap: 0.75rem;
          }
          .title {
            font-size: 1rem;
            font-weight: 700;
          }
          .subtitle {
            color: var(--bk-muted);
            font-size: 0.875rem;
          }

          .form {
            display: grid;
            gap: var(--bk-gap);
          }
          .row {
            display: grid;
            gap: var(--bk-gap);
            grid-template-columns: 1fr;
          }
          @container (min-width: 420px) {
            .row {
              grid-template-columns: 1fr 1fr;
            }
          }

          .field {
            display: grid;
            gap: 0.35rem;
          }
          .label {
            font-size: 0.75rem;
            color: var(--bk-muted);
          }
          .input {
            appearance: none;
            border: 1px solid rgba(2, 6, 23, 0.15);
            background: transparent;
            color: inherit;
            border-radius: 12px;
            padding: 0.65rem 0.75rem;
          }
          :host([theme='dark']) .input {
            border-color: rgba(255, 255, 255, 0.18);
          }

          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.7rem 1rem;
            border-radius: 12px;
            border: 0;
            font-weight: 700;
            background: var(--bk-brand);
            color: var(--bk-brand-text);
          }
          .button:focus-visible {
            outline: 2px solid rgba(0, 0, 0, 0.2);
            outline-offset: 2px;
          }
          :host([variant='ghost']) .button {
            background: transparent;
            color: var(--bk-brand);
            border: 1px solid currentColor;
          }
        }

        @layer components {
          /* expose parts for host customisation */
          .card {
            position: relative;
          }
        }
      </style>

      <div class="card" part="card">
        <div class="header" part="header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" opacity="0.15"></rect>
            <path d="M3 9h18" stroke="currentColor" opacity="0.25"></path>
            <circle cx="8.5" cy="13.5" r="1.25" fill="currentColor"></circle>
            <circle cx="12" cy="13.5" r="1.25" fill="currentColor" opacity="0.6"></circle>
            <circle cx="15.5" cy="17" r="1.25" fill="currentColor"></circle>
          </svg>
          <div>
            <div class="title" part="title">Book a slot</div>
            <div class="subtitle" part="subtitle">Enter details, pick a date, time & guests</div>
          </div>
        </div>

        <form class="form" part="form">
          <div class="row">
            <label class="field" part="field">
              <span class="label" part="label">Name</span>
              <input class="input" part="input text" type="text" name="name" required />
            </label>
            <label class="field" part="field">
              <span class="label" part="label">Date</span>
              <input class="input" part="input date" type="date" name="date" required />
            </label>
            <label class="field" part="field">
              <span class="label" part="label">Time</span>
              <select class="input" part="input select" name="time" required>
                <option value="" disabled selected>Select…</option>
                <option>09:00</option>
                <option>10:00</option>
                <option>11:00</option>
                <option>13:00</option>
                <option>14:00</option>
                <option>15:00</option>
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
              <path d="M5 12l4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            Book
          </button>
        </form>
      </div>
    `;
  }

  connectedCallback() {
    // When the form is submitted, prevent the default form submission,
    // collect the form data and emit a custom 'book' event with the
    // serialized form values. This event bubbles so host pages can
    // listen without needing to traverse into the shadow DOM.
    const form = this.shadowRoot.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const detail = Object.fromEntries(fd.entries());
        this.dispatchEvent(new CustomEvent('book', { detail, bubbles: true }));
      });
    }
  }

  attributeChangedCallback() {
    // No-op. The component's CSS reacts directly to the
    // presence/absence/value of theme, variant and density attributes.
  }
}

// Register the element once. If called multiple times this will throw,
// so guard against re-definition in environments such as live reload.
if (!customElements.get('booking-widget')) {
  customElements.define('booking-widget', BookingWidget);
}