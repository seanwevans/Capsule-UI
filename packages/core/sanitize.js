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
          }
        }
      }
    }
  };
  walker(node);
  return node;
}

export function sanitizeHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  sanitizeNode(template.content);
  return template.innerHTML;
}
