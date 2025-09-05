import { cva } from 'class-variance-authority';
import styles from './tabs.module.css';

export const tabsRecipe = cva(styles.tabs, {
  variants: {
    variant: {
      pill: styles['variant-pill']
    }
  }
});

/**
 * @typedef {import('class-variance-authority').VariantProps<typeof tabsRecipe>} TabsRecipeProps
 */

