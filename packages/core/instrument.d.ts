export interface InstrumentOptions {
  variantAttr?: string;
}
export function instrumentComponent(name: string, ctor: CustomElementConstructor, options?: InstrumentOptions): void;
export {};
