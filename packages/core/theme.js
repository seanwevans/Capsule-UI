let current = document.documentElement.dataset.theme || 'light';

const EVENT = 'capsule:themechange';

export function getTheme() {
  return current;
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  current = theme;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
}

export function onThemeChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
