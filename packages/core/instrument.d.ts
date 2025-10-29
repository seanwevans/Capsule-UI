/* eslint-disable no-unused-vars */

export interface InstrumentOptions {
  variantAttr?: string;
}
export type ElementConstructor<T extends HTMLElement = HTMLElement> = new (...args: any[]) => T;
export function instrumentComponent(
  name: string,
  ctor: ElementConstructor,
  options?: InstrumentOptions
): void;
export {};
