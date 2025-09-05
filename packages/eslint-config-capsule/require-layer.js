/**
 * @fileoverview ESLint rule that requires CSS tagged templates or strings to include an allowed @layer declaration.
 */

const DEFAULT_LAYER = 'components';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'require an @layer declaration in runtime CSS strings',
    },
    schema: [
      {
        type: 'object',
        properties: {
          layer: { type: ['string', 'array'] },
          layers: { type: ['string', 'array'] },
          libraries: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    let expected = options.layers || options.layer || DEFAULT_LAYER;
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    const libraries = options.libraries || ['css'];

    function containsLayer(text) {
      return expected.some((name) => text.includes(`@layer ${name}`));
    }

    function report(node) {
      context.report({
        node,
        message: `Expected '@layer ${expected[0]}' declaration.`,
      });
    }

    function checkText(node, text) {
      if (!containsLayer(text)) {
        report(node);
      }
    }

    return {
      TaggedTemplateExpression(node) {
        if (node.tag.type === 'Identifier' && libraries.includes(node.tag.name)) {
          const text = node.quasi.quasis.map((q) => q.value.raw).join('');
          checkText(node, text);
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && libraries.includes(node.callee.name)) {
          const arg = node.arguments[0];
          if (!arg) return;
          if (arg.type === 'TemplateLiteral') {
            const text = arg.quasis.map((q) => q.value.raw).join('');
            checkText(arg, text);
          } else if (arg.type === 'Literal' && typeof arg.value === 'string') {
            checkText(arg, arg.value);
          }
        }
      },
    };
  },
};
