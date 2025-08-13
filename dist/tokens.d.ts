export type ThemeName = 'light' | 'dark';
export type TokenName = '--color-background' | '--color-text' | '--color-brand' | '--spacing-sm' | '--spacing-md' | '--spacing-lg';
export type TokenValues = Record<ThemeName, string>;
export const tokens: Record<TokenName, TokenValues>;
export default tokens;

