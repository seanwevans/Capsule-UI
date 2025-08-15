export type ThemeName = 'light' | 'dark';
export type TokenName = '--color-background' | '--color-brand' | '--color-text' | '--spacing-lg' | '--spacing-md' | '--spacing-sm';
export type TokenValues = Record<ThemeName, string | number>;
export const tokens: Record<TokenName, TokenValues>;
export default tokens;

