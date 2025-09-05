import { cva } from 'class-variance-authority';
import styles from './modal.module.css';

export const modalRecipe = cva(styles.container, {
  variants: {
    variant: {
      fullscreen: styles['variant-fullscreen']
    }
  }
});

/**
 * @typedef {import('class-variance-authority').VariantProps<typeof modalRecipe>} ModalRecipeProps
 */

