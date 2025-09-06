/* eslint-disable no-unused-vars */
import type { VariantProps } from 'class-variance-authority';

export declare const cardRecipe: (options?: {
  variant?: 'outline' | 'ghost';
  size?: 'compact';
}) => string;

export type CardRecipeProps = VariantProps<typeof cardRecipe>;

