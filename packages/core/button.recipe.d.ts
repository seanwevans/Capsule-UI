/* eslint-disable no-unused-vars */
import type { VariantProps } from 'class-variance-authority';

export declare const buttonRecipe: (options?: {
  size?: 'sm' | 'lg';
  variant?: 'primary' | 'secondary';
}) => string;

export type ButtonRecipeProps = VariantProps<typeof buttonRecipe>;
