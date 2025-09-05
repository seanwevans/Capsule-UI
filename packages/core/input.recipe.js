import { cva } from 'class-variance-authority';
import styles from './input.module.css';

export const inputRecipe = cva(styles.input, {
  variants: {
    variant: {
      outline: styles['variant-outline']
    }
  }
});

/**
 * @typedef {import('class-variance-authority').VariantProps<typeof inputRecipe>} InputRecipeProps
 */

