export type ThemeName = 'dark' | 'light';
export type TokenName = '--color-background' | '--color-brand' | '--color-text' | '--good-token_1-inner_value' | '--spacing-lg' | '--spacing-md' | '--spacing-sm';
export type TokenValues = Record<ThemeName, string | number>;
export const tokens: Record<TokenName, TokenValues>;
export default tokens;

