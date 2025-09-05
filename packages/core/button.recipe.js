import { cva } from 'class-variance-authority';
import styles from './button.module.css';

export const buttonRecipe = cva(styles.button, {
  variants: {
    size: {
      sm: styles['size-sm'],
      lg: styles['size-lg']
    },
    variant: {
      primary: '',
      secondary: styles['variant-secondary']
    }
  },
  defaultVariants: {
    size: 'sm',
    variant: 'primary'
  }
});

/**
 * @typedef {import('class-variance-authority').VariantProps<typeof buttonRecipe>} ButtonRecipeProps
 */
