let current = 'light';

export function getTheme(el = typeof document !== 'undefined' ? document.documentElement : undefined) {
  if (!el) return current;
  return el.getAttribute('data-theme') || current;
}

export function setTheme(theme, el = typeof document !== 'undefined' ? document.documentElement : undefined) {
  if (!el) return;
  el.setAttribute('data-theme', theme);
  current = theme;
}

export function onThemeChange(callback, el = typeof document !== 'undefined' ? document.documentElement : undefined) {
  if (!el) return () => {};
  const observer = new MutationObserver(() => callback(getTheme(el)));
  observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}
