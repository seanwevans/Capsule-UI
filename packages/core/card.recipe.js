import { cva } from 'class-variance-authority';
import styles from './card.module.css';

export const cardRecipe = cva(styles.card, {
  variants: {
    variant: {
      outline: styles['variant-outline']
    }
  }
});

/**
 * @typedef {import('class-variance-authority').VariantProps<typeof cardRecipe>} CardRecipeProps
 */

