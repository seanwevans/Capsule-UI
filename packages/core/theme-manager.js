const varNameRe = /^[a-z0-9-]+$/i;

function sanitize(vars) {
  return Object.entries(vars).reduce((acc, [key, value]) => {
    if (!varNameRe.test(key)) {
      throw new Error(`Invalid CSS variable name: ${key}`);
    }
    const val = String(value);
    if (val.includes(';') || val.includes('}')) {
      throw new Error(`Invalid value for ${key}`);
    }
    acc[key] = val;
    return acc;
  }, {});
}

export class ThemeManager {
  static register(tenant, variables) {
    if (typeof document === 'undefined') return;
    const vars = sanitize(variables);
    const id = `caps-theme-${tenant}`;
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    const declarations = Object.entries(vars)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n');
    style.textContent = `[data-tenant="${tenant}"]{\n${declarations}\n}`;
  }

  static apply(tenant, element = document.documentElement) {
    if (typeof document === 'undefined') return;
    element.setAttribute('data-tenant', tenant);
  }
}
