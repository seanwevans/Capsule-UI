import { dispatchSafeEvent } from './events.js';

let current =
  typeof document !== 'undefined'
    ? {
        lang: document.documentElement.lang || 'en',
        dir: document.documentElement.dir || 'ltr',
      }
    : { lang: 'en', dir: 'ltr' };

const EVENT = 'capsule:localechange';

export function getLocale() {
  return { ...current };
}

export function setLocale({ lang, dir } = {}) {
  if (lang) {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    current.lang = lang;
  }
  if (dir) {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
    }
    current.dir = dir;
  }
  if (typeof window !== 'undefined') {
    dispatchSafeEvent(window, EVENT, { ...current }, { bubbles: false });
  }
}

export function onLocaleChange(callback) {
  const handler = (e) => callback(e.detail);
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }
  return () => {};
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
