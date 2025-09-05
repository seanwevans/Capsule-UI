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

const numberFormatCache = new Map();
const dateFormatCache = new Map();

export function formatNumber(value, options = {}) {
  const lang = current.lang;
  const key = lang + JSON.stringify(options);
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(lang, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter.format(value);
}

export function formatDate(value, options = {}) {
  const lang = current.lang;
  const key = lang + JSON.stringify(options);
  let formatter = dateFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(lang, options);
    dateFormatCache.set(key, formatter);
  }
  return formatter.format(value);
}

export function setDirection(dir) {
  setLocale({ dir });
}
