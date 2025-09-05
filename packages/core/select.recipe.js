import { cva } from 'class-variance-authority';
import styles from './select.module.css';

export const selectRecipe = cva(styles.select, {
  variants: {
    variant: {
      outline: styles['variant-outline']
    }
  }
});

/**
 * @typedef {import('class-variance-authority').VariantProps<typeof selectRecipe>} SelectRecipeProps
 */

