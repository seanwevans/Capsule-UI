/* eslint-disable no-unused-vars */

export interface AnalyticsOptions {
  endpoint?: string;
}
export function enableAnalytics(options?: AnalyticsOptions): void;
export function disableAnalytics(): void;
export function trackComponent(name: string, variant?: string): void;
export {};
