module.exports = function tailwindToCapsule(fileInfo, api, options) {
  const j = api.jscodeshift;
  const ext = fileInfo.path.split('.').pop();
  const source = fileInfo.source;
  let didTransform = false;

  const utilMap = {
    btn: 'CapsButton',
    input: 'CapsInput',
    card: 'CapsCard',
    tabs: 'CapsTabs',
    modal: 'CapsModal',
    select: 'CapsSelect'
  };
  const utilPrefixes = Object.keys(utilMap);

  if (ext === 'vue' || ext === 'svelte') {
    const pkg = ext === 'vue' ? '@capsule-ui/vue' : '@capsule-ui/svelte';
    let out = source;
    const used = new Set();

    const vueMap = [
      { prefix: 'btn', tag: 'button', component: 'CapsButton', selfClosing: false },
      { prefix: 'input', tag: 'input', component: 'CapsInput', selfClosing: true },
      { prefix: 'card', tag: 'div', component: 'CapsCard', selfClosing: false },
      { prefix: 'tabs', tag: 'div', component: 'CapsTabs', selfClosing: false },
      { prefix: 'modal', tag: 'div', component: 'CapsModal', selfClosing: false },
      { prefix: 'select', tag: 'select', component: 'CapsSelect', selfClosing: false }
    ];

    vueMap.forEach(({ prefix, tag, component, selfClosing }) => {
      if (selfClosing) {
        const re = new RegExp(
          `<${tag}([^>]*?)class=["']([^"']*?${prefix}[^"']*?)["']([^>]*)/?>`,
          'g'
        );
        out = out.replace(re, (match, pre, classes, post) => {
          used.add(component);
          didTransform = true;
          const m = classes.match(new RegExp(`${prefix}-([\\w-]+)`));
          const variant = m ? ` variant=\\"${m[1]}\\"` : '';
          return `<${component}${variant}${pre}${post} />`;
        });
      } else {
        const re = new RegExp(
          `<${tag}([^>]*?)class=["']([^"']*?${prefix}[^"']*?)["']([^>]*)>([\\s\\S]*?)</${tag}>`,
          'g'
        );
        out = out.replace(re, (match, pre, classes, post, inner) => {
          used.add(component);
          didTransform = true;
          const m = classes.match(new RegExp(`${prefix}-([\\w-]+)`));
          const variant = m ? ` variant=\\"${m[1]}\\"` : '';
          return `<${component}${variant}${pre}${post}>${inner}</${component}>`;
        });
      }
    });

    if (didTransform && used.size) {
      const imports = Array.from(used).join(', ');
      if (!out.includes(pkg)) {
        if (ext === 'vue') {
          out = out.replace(
            /<script[^>]*>/,
            (m) => `${m}\nimport { ${imports} } from '${pkg}';`
          );
        } else {
          out = `import { ${imports} } from '${pkg}';\n` + out;
        }
      }
    }

    return out;
  }

  const root = j(source);
  const replacements = new Set();

  const parseLiteral = (str) => str.split(/\s+/).filter(Boolean);

  const extractClasses = (node, classNames, variantExprs) => {
    if (!node) return;
    switch (node.type) {
      case 'Literal':
      case 'StringLiteral':
        classNames.push(...parseLiteral(node.value));
        break;
      case 'TemplateLiteral':
        node.quasis.forEach((q, i) => {
          const text = q.value.cooked;
          if (text) classNames.push(...parseLiteral(text));
          const expr = node.expressions[i];
          if (expr) {
            const last = text.split(/\s+/).pop();
            utilPrefixes.forEach((p) => {
              if (last && last.endsWith(p + '-')) {
                variantExprs[p] = expr;
                classNames.push(p);
              }
            });
            extractClasses(expr, classNames, variantExprs);
          }
        });
        break;
      case 'BinaryExpression':
        if (node.operator === '+') {
          extractClasses(node.left, classNames, variantExprs);
          extractClasses(node.right, classNames, variantExprs);
        }
        break;
      case 'ConditionalExpression':
        extractClasses(node.consequent, classNames, variantExprs);
        extractClasses(node.alternate, classNames, variantExprs);
        break;
      case 'LogicalExpression':
        extractClasses(node.left, classNames, variantExprs);
        extractClasses(node.right, classNames, variantExprs);
        break;
      case 'ArrayExpression':
        node.elements.forEach((el) => extractClasses(el, classNames, variantExprs));
        break;
      case 'ObjectExpression':
        node.properties.forEach((prop) => {
          if (prop.type === 'Property') {
            const key = prop.key;
            if (key.type === 'Literal' || key.type === 'StringLiteral') {
              classNames.push(...parseLiteral(key.value));
            } else if (key.type === 'TemplateLiteral') {
              extractClasses(key, classNames, variantExprs);
            }
            extractClasses(prop.value, classNames, variantExprs);
          }
        });
        break;
      case 'CallExpression':
        if (
          node.callee.type === 'Identifier' &&
          ['clsx', 'classnames', 'cx'].includes(node.callee.name)
        ) {
          node.arguments.forEach((arg) => extractClasses(arg, classNames, variantExprs));
        }
        break;
      default:
        break;
    }
  };

  root.find(j.JSXElement).forEach((path) => {
    const attrs = path.node.openingElement.attributes;
    const classAttr = attrs.find((a) => a.name && a.name.name === 'className');
    if (!classAttr) return;

    const classNames = [];
    const variantExprs = {};

    if (classAttr.value.type === 'Literal') {
      classNames.push(...parseLiteral(classAttr.value.value));
    } else if (classAttr.value.type === 'StringLiteral') {
      classNames.push(...parseLiteral(classAttr.value.value));
    } else if (classAttr.value.type === 'JSXExpressionContainer') {
      extractClasses(classAttr.value.expression, classNames, variantExprs);
    }

    let info = null;
    for (const prefix of utilPrefixes) {
      const component = utilMap[prefix];
      const variantExpr = variantExprs[prefix];
      const cn = classNames.find((c) => c === prefix || c.startsWith(prefix + '-'));
      if (cn || variantExpr) {
        let variant = null;
        if (!variantExpr && cn && cn.startsWith(prefix + '-')) {
          variant = cn.slice(prefix.length + 1);
        }
        info = { component, variant, variantExpr };
        break;
      }
    }

    if (!info) return;
    didTransform = true;
    replacements.add(info.component);

    if (info.variantExpr) {
      attrs.push(
        j.jsxAttribute(
          j.jsxIdentifier('variant'),
          j.jsxExpressionContainer(info.variantExpr)
        )
      );
    } else if (info.variant) {
      attrs.push(
        j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral(info.variant))
      );
    }

    path.node.openingElement.name.name = info.component;
    if (path.node.closingElement) path.node.closingElement.name.name = info.component;
    path.node.openingElement.attributes = attrs.filter(
      (a) => !(a.name && a.name.name === 'className')
    );
  });

  if (didTransform) {
    const existing = root.find(j.ImportDeclaration, {
      source: { value: '@capsule-ui/react' }
    });
    const specs = Array.from(replacements).map((c) =>
      j.importSpecifier(j.identifier(c))
    );
    if (existing.size()) {
      const importSpecs = existing.get(0).node.specifiers;
      specs.forEach((s) => {
        if (!importSpecs.some((i) => i.imported && i.imported.name === s.imported.name)) {
          importSpecs.push(s);
        }
      });
    } else {
      root.get().node.program.body.unshift(
        j.importDeclaration(specs, j.stringLiteral('@capsule-ui/react'))
      );
    }
  }

  return root.toSource(options);
};
