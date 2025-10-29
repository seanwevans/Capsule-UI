export function sanitizeNode(node) {
  // Remove <script> elements and any inline event handlers to mitigate XSS
  const walker = (el) => {
    if (el.querySelectorAll) {
      el.querySelectorAll('script,link[rel="import"],meta,style').forEach((s) => s.remove());
    }
    if (el instanceof Element || el instanceof DocumentFragment) {
      const elements = el instanceof Element ? [el, ...el.querySelectorAll('*')] : [...el.querySelectorAll('*')];
      for (const elem of elements) {
        for (const attr of [...elem.attributes]) {
          if (/^on/i.test(attr.name)) {
            elem.removeAttribute(attr.name);
            continue;
          }

          const attrName = attr.name.toLowerCase();
          if (URL_ATTRIBUTE_NAMES.has(attrName)) {
            const sanitizer = attrName === 'srcset' ? sanitizeSrcsetAttribute : sanitizeUrlAttribute;
            const sanitizedValue = sanitizer(attr.value);
            if (sanitizedValue === null) {
              elem.removeAttribute(attr.name);
            } else if (sanitizedValue !== attr.value) {
              elem.setAttribute(attr.name, sanitizedValue);
            }
          }
        }
      }
    }
  };
  walker(node);
  return node;
}

const URL_ATTRIBUTE_NAMES = new Set([
  'action',
  'cite',
  'data',
  'formaction',
  'href',
  'poster',
  'src',
  'srcdoc',
  'srcset',
  'xlink:href',
]);

const DANGEROUS_SCHEMES = [
  'javascript:',
  'vbscript:',
  'data:',
  'file:',
  'filesystem:',
  'chrome:',
  'resource:',
  'moz-extension:',
  'ms-appx:',
  'ms-appx-web:',
  'about:',
];

function sanitizeUrlAttribute(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return null;
  }

  if (isDangerousUrl(normalized)) {
    return null;
  }

  return normalized;
}

function sanitizeSrcsetAttribute(value) {
  if (!value) {
    return null;
  }

  if (containsDangerousScheme(value)) {
    return null;
  }

  return value.trim();
}

function normalizeUrl(value) {
  if (!value) {
    return '';
  }

  const trimmed = value.trim().replace(/[\u0000-\u001F\u007F-\u009F]+/g, '');
  return trimmed;
}

function isDangerousUrl(value) {
  const lowerCased = value.toLowerCase();
  return DANGEROUS_SCHEMES.some((scheme) => lowerCased.startsWith(scheme));
}

function containsDangerousScheme(value) {
  if (!value) {
    return false;
  }

  const lowered = value.toLowerCase();
  return DANGEROUS_SCHEMES.some((scheme) => {
    const pattern = new RegExp(`(^|[\\s,])${escapeForRegExp(scheme)}`);
    return pattern.test(lowered);
  });
}

function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitizeHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  sanitizeNode(template.content);
  return template.innerHTML;
}
