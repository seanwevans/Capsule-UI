export interface DispatchEventOptions {
  bubbles?: boolean;
  composed?: boolean;
}
export function dispatchSafeEvent<T = any>(target: EventTarget, name: string, detail?: T, options?: DispatchEventOptions): CustomEvent<T>;
export {};
