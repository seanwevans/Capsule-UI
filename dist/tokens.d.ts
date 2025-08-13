export type TokenName = '--color-background' | '--color-text' | '--color-brand' | '--spacing-sm' | '--spacing-md' | '--spacing-lg';
export interface TokenValues { light: string; dark: string; }
export const tokens: Record<TokenName, TokenValues>;
export default tokens;

