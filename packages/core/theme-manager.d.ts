export class ThemeManager {
  static register(tenant: string, variables: Record<string, string | number>): void;
  static registerTheme(tenant: string, theme: string, variables: Record<string, string | number>): void;
  static load(tenant: string, url: string): Promise<boolean>;
  static apply(tenant: string, element?: HTMLElement): void;
  static applyTheme(tenant: string, theme: string, element?: HTMLElement): void;
  static unregister(tenant: string): void;
  static unregisterTheme(tenant: string, theme: string): void;
  static reset(element?: HTMLElement): void;
}
export {};
