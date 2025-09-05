export type ThemeName = 'dark' | 'light' | 'ocean';
export type TokenName = '--color-background' | '--color-border' | '--color-brand' | '--color-overlay' | '--color-secondary' | '--color-text' | '--motion-fast' | '--radius-lg' | '--radius-md' | '--radius-sm' | '--shadow-sm' | '--spacing-2xl' | '--spacing-lg' | '--spacing-md' | '--spacing-sm' | '--spacing-xl' | '--spacing-xs';
export type TokenValues = Record<ThemeName, string | number>;
export const tokens: Record<TokenName, TokenValues>;
export default tokens;

