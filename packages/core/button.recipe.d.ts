/* eslint-disable no-unused-vars */
import type { VariantProps } from 'class-variance-authority';

export declare const buttonRecipe: (options?: {
  size?: 'sm' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}) => string;

export type ButtonRecipeProps = VariantProps<typeof buttonRecipe>;
