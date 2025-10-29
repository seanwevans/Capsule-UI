/* eslint-disable no-unused-vars */

export function getTheme(el?: HTMLElement): string;
export function setTheme(theme: string, el?: HTMLElement): void;
export function onThemeChange(callback: (theme: string) => void, el?: HTMLElement): () => void;
export {};
