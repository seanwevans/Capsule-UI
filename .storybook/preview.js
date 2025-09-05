const themes = ['light', 'dark'];
const densities = ['default', 'compact'];
const locales = [
  { label: 'en', lang: 'en', dir: 'ltr' },
  { label: 'ar', lang: 'ar', dir: 'rtl' }
];

export const decorators = [
  (story) => {
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gap = '1rem';
    themes.forEach(theme => {
      densities.forEach(density => {
        locales.forEach(locale => {
          const cell = document.createElement('div');
          const el = story();
          if (theme !== 'light') el.setAttribute('theme', theme);
          if (density !== 'default') el.setAttribute('density', density);
          el.setAttribute('lang', locale.lang);
          el.setAttribute('dir', locale.dir);
          const label = document.createElement('div');
          label.style.fontSize = '12px';
          label.textContent = `${theme}/${density}/${locale.label}`;
          cell.appendChild(label);
          cell.appendChild(el);
          grid.appendChild(cell);
        });
      });
    });
    return grid;
  }
];

export const parameters = { layout: 'padded' };
