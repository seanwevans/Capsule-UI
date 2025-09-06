const eventNameRe = /^[a-z0-9:-]+$/i;

export function dispatchSafeEvent(target, name, detail = {}, options = {}) {
  const sanitized = String(name).replace(/[^a-z0-9:-]/gi, '-');
  if (!eventNameRe.test(sanitized)) {
    throw new Error(`Invalid event name: ${name}`);
  }
  const {
    bubbles = true,
    composed = false,
  } = options;
  const event = new CustomEvent(sanitized, { detail, bubbles, composed });
  target.dispatchEvent(event);
  return event;
}
