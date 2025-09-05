module.exports = function tailwindToCapsule(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ext = fileInfo.path.split('.').pop();
  const source = fileInfo.source;
  let didTransform = false;

  if (ext === 'vue' || ext === 'svelte') {
    let pkg;
    if (ext === 'vue') pkg = '@capsule-ui/vue';
    else pkg = '@capsule-ui/svelte';
    let out = source.replace(/<button([^>]*?)class=["']([^"']*?btn[^"']*?)["']([^>]*)>/g, (match, pre, classes, post) => {
      didTransform = true;
      const m = classes.match(/btn-([\w-]+)/);
      const variant = m ? ` variant=\"${m[1]}\"` : '';
      return `<CapsButton${variant}${pre}${post}>`;
    }).replace(/<\/button>/g, '</CapsButton>');
    if (didTransform) {
      if (!out.includes(pkg)) {
        if (ext === 'vue') {
          out = out.replace(/<script[^>]*>/, (m) => `${m}\nimport { CapsButton } from '${pkg}';`);
        } else {
          out = `import { CapsButton } from '${pkg}';\n` + out;
        }
      }
    }
    return out;
  }

  const root = j(source);

  root.find(j.JSXElement, { openingElement: { name: { name: 'button' } } }).forEach((path) => {
    const attrs = path.node.openingElement.attributes;
    const classAttr = attrs.find((a) => a.name && a.name.name === 'className');
    if (!classAttr) return;
    let classValue = null;
    if (classAttr.value && classAttr.value.type === 'Literal') classValue = classAttr.value.value;
    else if (
      classAttr.value &&
      classAttr.value.type === 'StringLiteral'
    )
      classValue = classAttr.value.value;
    else if (
      classAttr.value &&
      classAttr.value.type === 'JSXExpressionContainer' &&
      classAttr.value.expression.type === 'StringLiteral'
    )
      classValue = classAttr.value.expression.value;
    if (!classValue || !classValue.includes('btn')) return;
    didTransform = true;
    const m = classValue.match(/btn-([\w-]+)/);
    if (m) {
      attrs.push(j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral(m[1])));
    }
    path.node.openingElement.name.name = 'CapsButton';
    if (path.node.closingElement) path.node.closingElement.name.name = 'CapsButton';
    path.node.openingElement.attributes = attrs.filter((a) => !(a.name && a.name.name === 'className'));
  });

  if (didTransform) {
    const importDecl = j.importDeclaration(
      [j.importSpecifier(j.identifier('CapsButton'))],
      j.stringLiteral('@capsule-ui/react')
    );
    const existing = root.find(j.ImportDeclaration, { source: { value: '@capsule-ui/react' } });
    if (existing.size()) {
      const specs = existing.get(0).node.specifiers;
      if (!specs.some((s) => s.imported && s.imported.name === 'CapsButton')) {
        specs.push(j.importSpecifier(j.identifier('CapsButton')));
      }
    } else {
      root.get().node.program.body.unshift(importDecl);
    }
  }

  return root.toSource(options);
};
