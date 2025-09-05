export type ThemeName = 'dark' | 'light';
export type TokenName = '--color-background' | '--color-brand' | '--color-error' | '--color-success' | '--color-text' | '--color-warning' | '--motion-duration-fast' | '--motion-duration-normal' | '--motion-duration-slow' | '--radius-full' | '--radius-lg' | '--radius-md' | '--radius-none' | '--radius-sm' | '--spacing-2xl' | '--spacing-lg' | '--spacing-md' | '--spacing-sm' | '--spacing-xl' | '--spacing-xs' | '--typography-font-size-lg' | '--typography-font-size-md' | '--typography-font-size-sm' | '--typography-font-size-xl' | '--typography-font-weight-bold' | '--typography-font-weight-medium' | '--typography-font-weight-regular' | '--typography-line-height-lg' | '--typography-line-height-md' | '--typography-line-height-sm' | '--z-index-base' | '--z-index-dropdown' | '--z-index-modal' | '--z-index-popover' | '--z-index-tooltip';
export type TokenValues = Record<ThemeName, string | number>;
export const tokens: Record<TokenName, TokenValues>;
export default tokens;

