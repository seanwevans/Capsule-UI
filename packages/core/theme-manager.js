const varNameRe = /^[a-z0-9-]+$/i;
const tenantThemeRe = /^[a-z0-9-]+$/i;

function sanitizeName(name) {
  const sanitized = String(name).replace(/[^a-z0-9-]/gi, '-');
  if (!tenantThemeRe.test(sanitized)) {
    throw new Error(`Invalid tenant or theme: ${name}`);
  }
  return sanitized;
}

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

function _injectStyle(id, selector, vars) {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  const declarations = Object.entries(vars)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');
  style.textContent = `${selector}{\n${declarations}\n}`;
}

export class ThemeManager {
  static register(tenant, variables) {
    if (typeof document === 'undefined') return;
    tenant = sanitizeName(tenant);
    const vars = sanitize(variables);
    const id = `caps-theme-${tenant}`;
    const selector = `[data-tenant="${tenant}"]`;
    _injectStyle(id, selector, vars);
  }

  static registerTheme(tenant, theme, variables) {
    if (typeof document === 'undefined') return;
    tenant = sanitizeName(tenant);
    theme = sanitizeName(theme);
    const vars = sanitize(variables);
    const id = `caps-theme-${tenant}-${theme}`;
    const selector = `[data-tenant="${tenant}"][data-theme="${theme}"]`;
    _injectStyle(id, selector, vars);
  }

  static async load(tenant, url) {
    if (typeof fetch === 'undefined') return false;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed to load themes from ${url}: ${res.status} ${res.statusText}`);
        return false;
      }
      const themes = await res.json();
      for (const [theme, vars] of Object.entries(themes)) {
        this.registerTheme(tenant, theme, vars);
      }
      return true;
    } catch (err) {
      console.error(`Failed to load themes from ${url}:`, err);
      return false;
    }
  }

  static apply(tenant, element = document.documentElement) {
    if (typeof document === 'undefined') return;
    tenant = sanitizeName(tenant);
    element.setAttribute('data-tenant', tenant);
  }

  static applyTheme(tenant, theme, element = document.documentElement) {
    if (typeof document === 'undefined') return;
    tenant = sanitizeName(tenant);
    theme = sanitizeName(theme);
    element.setAttribute('data-tenant', tenant);
    element.setAttribute('data-theme', theme);
  }

  static unregister(tenant) {
    if (typeof document === 'undefined') return;
    const id = `caps-theme-${sanitizeName(tenant)}`;
    document.getElementById(id)?.remove();
  }

  static unregisterTheme(tenant, theme) {
    if (typeof document === 'undefined') return;
    const id = `caps-theme-${sanitizeName(tenant)}-${sanitizeName(theme)}`;
    document.getElementById(id)?.remove();
  }

  static reset(element = document.documentElement) {
    if (typeof document === 'undefined') return;
    element.removeAttribute('data-tenant');
    element.removeAttribute('data-theme');
  }
}
