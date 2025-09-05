let current = {
  lang: document.documentElement.lang || 'en',
  dir: document.documentElement.dir || 'ltr'
};

const EVENT = 'capsule:localechange';

export function getLocale() {
  return { ...current };
}

export function setLocale({ lang, dir } = {}) {
  if (lang) {
    document.documentElement.lang = lang;
    current.lang = lang;
  }
  if (dir) {
    document.documentElement.dir = dir;
    current.dir = dir;
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { ...current } }));
}

export function onLocaleChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
