/* eslint-disable no-unused-vars */

export interface Locale {
  lang: string;
  dir: string;
}
export type BaseElementConstructor<T extends HTMLElement = HTMLElement> = new (...args: any[]) => T;
export function withLocaleDir<TBase extends BaseElementConstructor>(Base?: TBase): {
  new (...args: any[]): InstanceType<TBase> & HTMLElement & {
    localeDirChanged?(loc: Locale): void;
  };
} & TBase;
export {};
