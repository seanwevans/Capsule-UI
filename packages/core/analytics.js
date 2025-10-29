let enabled = false;
let endpoint = '';
const counts = {};
let timerId;
let listenerAttached = false;

export function enableAnalytics({ endpoint: ep } = {}) {
  enabled = true;
  endpoint = ep || '/analytics';
  if (typeof window !== 'undefined') {
    if (!listenerAttached) {
      window.addEventListener('beforeunload', send);
      listenerAttached = true;
    }
    if (!timerId) {
      timerId = setInterval(send, 60000);
    }
  }
}

export function disableAnalytics() {
  enabled = false;
  if (typeof window !== 'undefined') {
    if (listenerAttached) {
      window.removeEventListener('beforeunload', send);
      listenerAttached = false;
    }
    if (timerId) {
      clearInterval(timerId);
      timerId = undefined;
    }
  }
}

export function trackComponent(name, variant = 'default') {
  if (!enabled) return;
  const key = `${name}:${variant || 'default'}`;
  counts[key] = (counts[key] || 0) + 1;
}

async function send() {
  if (!enabled || !endpoint) return;
  const snapshotEntries = Object.entries(counts);
  if (snapshotEntries.length === 0) return;
  const payload = { counts: Object.fromEntries(snapshotEntries) };
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    for (const [key, value] of snapshotEntries) {
      const remaining = (counts[key] || 0) - value;
      if (remaining > 0) {
        counts[key] = remaining;
      } else {
        delete counts[key];
      }
    }
  } catch {
    // ignore network errors
  }
}
