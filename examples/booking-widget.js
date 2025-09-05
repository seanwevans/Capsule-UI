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
    // Build the widget's shadow DOM without using innerHTML to mitigate
    // injection risks. CSS variables defined on the host element cascade
    // into the shadow DOM and are used by the styles below. The @layer
    // directive establishes ordering between layers – reset, base,
    // components and overrides – similar to the Capsule UI philosophy.

    const style = document.createElement('style');
    style.textContent = `
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
      `;

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('part', 'card');

    const header = document.createElement('div');
    header.className = 'header';
    header.setAttribute('part', 'header');

    const svgNS = 'http://www.w3.org/2000/svg';
    const icon = document.createElementNS(svgNS, 'svg');
    icon.setAttribute('width', '28');
    icon.setAttribute('height', '28');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('aria-hidden', 'true');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', '3');
    rect.setAttribute('y', '4');
    rect.setAttribute('width', '18');
    rect.setAttribute('height', '17');
    rect.setAttribute('rx', '3');
    rect.setAttribute('stroke', 'currentColor');
    rect.setAttribute('opacity', '0.15');
    icon.appendChild(rect);

    const topPath = document.createElementNS(svgNS, 'path');
    topPath.setAttribute('d', 'M3 9h18');
    topPath.setAttribute('stroke', 'currentColor');
    topPath.setAttribute('opacity', '0.25');
    icon.appendChild(topPath);

    const c1 = document.createElementNS(svgNS, 'circle');
    c1.setAttribute('cx', '8.5');
    c1.setAttribute('cy', '13.5');
    c1.setAttribute('r', '1.25');
    c1.setAttribute('fill', 'currentColor');
    icon.appendChild(c1);

    const c2 = document.createElementNS(svgNS, 'circle');
    c2.setAttribute('cx', '12');
    c2.setAttribute('cy', '13.5');
    c2.setAttribute('r', '1.25');
    c2.setAttribute('fill', 'currentColor');
    c2.setAttribute('opacity', '0.6');
    icon.appendChild(c2);

    const c3 = document.createElementNS(svgNS, 'circle');
    c3.setAttribute('cx', '15.5');
    c3.setAttribute('cy', '17');
    c3.setAttribute('r', '1.25');
    c3.setAttribute('fill', 'currentColor');
    icon.appendChild(c3);

    header.appendChild(icon);

    const headerText = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'title';
    title.setAttribute('part', 'title');
    title.textContent = 'Book a slot';
    const subtitle = document.createElement('div');
    subtitle.className = 'subtitle';
    subtitle.setAttribute('part', 'subtitle');
    subtitle.textContent = 'Enter details, pick a date, time & guests';
    headerText.append(title, subtitle);
    header.appendChild(headerText);

    card.appendChild(header);

    const form = document.createElement('form');
    form.className = 'form';
    form.setAttribute('part', 'form');

    const row = document.createElement('div');
    row.className = 'row';

    const makeField = (labelText, inputEl) => {
      const field = document.createElement('label');
      field.className = 'field';
      field.setAttribute('part', 'field');
      const span = document.createElement('span');
      span.className = 'label';
      span.setAttribute('part', 'label');
      span.textContent = labelText;
      field.append(span, inputEl);
      return field;
    };

    const nameInput = document.createElement('input');
    nameInput.className = 'input';
    nameInput.setAttribute('part', 'input text');
    nameInput.type = 'text';
    nameInput.name = 'name';
    nameInput.required = true;
    row.appendChild(makeField('Name', nameInput));

    const dateInput = document.createElement('input');
    dateInput.className = 'input';
    dateInput.setAttribute('part', 'input date');
    dateInput.type = 'date';
    dateInput.name = 'date';
    dateInput.required = true;
    row.appendChild(makeField('Date', dateInput));

    const timeSelect = document.createElement('select');
    timeSelect.className = 'input';
    timeSelect.setAttribute('part', 'input select');
    timeSelect.name = 'time';
    timeSelect.required = true;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = 'Select…';
    timeSelect.appendChild(placeholder);
    ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].forEach((t) => {
      const opt = document.createElement('option');
      opt.textContent = t;
      timeSelect.appendChild(opt);
    });
    row.appendChild(makeField('Time', timeSelect));

    const guestsInput = document.createElement('input');
    guestsInput.className = 'input';
    guestsInput.setAttribute('part', 'input number');
    guestsInput.type = 'number';
    guestsInput.name = 'guests';
    guestsInput.min = '1';
    guestsInput.max = '12';
    guestsInput.value = '2';
    row.appendChild(makeField('Guests', guestsInput));

    const notesInput = document.createElement('input');
    notesInput.className = 'input';
    notesInput.setAttribute('part', 'input text');
    notesInput.type = 'text';
    notesInput.name = 'notes';
    notesInput.placeholder = 'Allergies, requests…';
    row.appendChild(makeField('Notes (optional)', notesInput));

    form.appendChild(row);

    const button = document.createElement('button');
    button.className = 'button';
    button.setAttribute('part', 'button');
    button.type = 'submit';

    const checkSvg = document.createElementNS(svgNS, 'svg');
    checkSvg.setAttribute('width', '16');
    checkSvg.setAttribute('height', '16');
    checkSvg.setAttribute('viewBox', '0 0 24 24');
    checkSvg.setAttribute('fill', 'none');
    checkSvg.setAttribute('aria-hidden', 'true');

    const checkPath = document.createElementNS(svgNS, 'path');
    checkPath.setAttribute('d', 'M5 12l4 4L19 6');
    checkPath.setAttribute('stroke', 'currentColor');
    checkPath.setAttribute('stroke-width', '2');
    checkPath.setAttribute('stroke-linecap', 'round');
    checkPath.setAttribute('stroke-linejoin', 'round');
    checkSvg.appendChild(checkPath);

    button.append(checkSvg, 'Book');

    form.appendChild(button);
    card.appendChild(form);

    this.shadowRoot.append(style, card);
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