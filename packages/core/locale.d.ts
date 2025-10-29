/* eslint-disable no-unused-vars */

export interface Locale {
  lang: string;
  dir: string;
}
export function getLocale(): Locale;
export function setLocale(loc: Partial<Locale>): void;
export function onLocaleChange(callback: (loc: Locale) => void): () => void;
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
export function formatDate(value: number | Date, options?: Intl.DateTimeFormatOptions): string;
export function setDirection(dir: string): void;
export {};
