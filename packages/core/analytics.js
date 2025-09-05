let enabled = false;
let endpoint = '';
const counts = {};

export function enableAnalytics({ endpoint: ep } = {}) {
  enabled = true;
  endpoint = ep || '/analytics';
}

export function disableAnalytics() {
  enabled = false;
}

export function trackComponent(name, variant = 'default') {
  if (!enabled) return;
  const key = `${name}:${variant || 'default'}`;
  counts[key] = (counts[key] || 0) + 1;
}

async function send() {
  if (!enabled || !endpoint) return;
  const payload = { counts };
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    for (const key in counts) delete counts[key];
  } catch {
    // ignore network errors
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', send);
  setInterval(send, 60000);
}
