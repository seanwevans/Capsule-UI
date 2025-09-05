module.exports = function emotionToCapsule(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let styledName = 'styled';
  let didTransform = false;

  const importDecls = root.find(j.ImportDeclaration).filter((p) =>
    ['@emotion/styled', 'styled-components'].includes(p.node.source.value)
  );

  importDecls.forEach((path) => {
    const spec = path.node.specifiers.find((s) => s.type === 'ImportDefaultSpecifier');
    if (spec) styledName = spec.local.name;
  });

  const buttonDecls = root.find(j.VariableDeclarator, {
    init: (node) => {
      if (!node) return false;
      if (node.type === 'CallExpression') {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === styledName &&
          node.callee.property.name === 'button'
        )
          return true;
        if (
          node.callee.type === 'CallExpression' &&
          node.callee.callee.name === styledName &&
          node.callee.arguments[0] &&
          node.callee.arguments[0].value === 'button'
        )
          return true;
      }
      return false;
    }
  });

  buttonDecls.forEach((path) => {
    const varName = path.node.id.name;
    const variantMatch = varName.replace(/Button$/, '');
    const variant = variantMatch && variantMatch !== varName ? variantMatch.toLowerCase() : null;

    root.find(j.JSXIdentifier, { name: varName }).forEach((idPath) => {
      idPath.node.name = 'CapsButton';
      const jsxElem = idPath.parent.parent.node;
      if (jsxElem && jsxElem.openingElement) {
        const attrs = jsxElem.openingElement.attributes;
        if (variant && !attrs.some((a) => a.name && a.name.name === 'variant')) {
          attrs.push(j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral(variant)));
        }
      }
    });

    j(path).remove();
    didTransform = true;
  });

  if (didTransform) {
    importDecls.remove();
    const existing = root.find(j.ImportDeclaration, { source: { value: '@capsule-ui/react' } });
    if (existing.size()) {
      const specs = existing.get(0).node.specifiers;
      if (!specs.some((s) => s.imported && s.imported.name === 'CapsButton')) {
        specs.push(j.importSpecifier(j.identifier('CapsButton')));
      }
    } else {
      root.get().node.program.body.unshift(
        j.importDeclaration(
          [j.importSpecifier(j.identifier('CapsButton'))],
          j.stringLiteral('@capsule-ui/react')
        )
      );
    }
  }

  return root.toSource(options);
};
