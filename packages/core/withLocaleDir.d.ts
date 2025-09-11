export interface Locale {
  lang: string;
  dir: string;
}
export function withLocaleDir<TBase extends CustomElementConstructor>(Base?: TBase): {
  new (...args: any[]): InstanceType<TBase> & HTMLElement & {
    localeDirChanged?(loc: Locale): void;
  };
} & TBase;
export {};
