const stylelint = require('stylelint');

/**
 * Stylelint rule enforcing a named `@layer` declaration.
 *
 * @param {{name?: string}} [options] configuration with expected layer name (default: "components").
 * @example
 * // stylelint config
 * {
 *   "rules": { "capsule-ui/require-layer": { "name": "my-layer" } }
 * }
 * // Missing layer will be auto-inserted when `--fix` is used.
 */
const ruleName = 'capsule-ui/require-layer';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (name) => `Expected '@layer ${name}' declaration.`,
});

module.exports = stylelint.createPlugin(ruleName, function (options = {}, _, context) {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: options,
      possible: {
        name: [String],
      },
      optional: true,
    });
    if (!validOptions) {
      return;
    }

    const expected = options.name || 'components';

    const source = root.source && root.source.input && root.source.input.css;
    let newline = '\n';
    if (source && source.includes('\r\n')) {
      newline = '\r\n';
    } else if (root.raws) {
      for (const key in root.raws) {
        const value = root.raws[key];
        if (typeof value === 'string' && value.includes('\r\n')) {
          newline = '\r\n';
          break;
        }
      }
    }

    let hasLayer = false;
    root.walkAtRules('layer', (rule) => {
      if (rule.parent !== root) {
        return;
      }
      const layers = rule.params
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      if (layers.includes(expected)) {
        hasLayer = true;
      }
    });

    if (!hasLayer) {
      if (context && context.fix) {
        let insertAfter = null;
        const skip = new Set(['charset', 'import', 'namespace']);

        for (const node of root.nodes || []) {
          if (node.type === 'atrule' && skip.has(node.name)) {
            insertAfter = node;
            continue;
          }
          break;
        }

        if (insertAfter) {
          insertAfter.after(`${newline}@layer ${expected};${newline}`);
        } else {
          root.prepend(`@layer ${expected};${newline}`);
          if (root.nodes[1]) {
            root.nodes[1].raws.before = root.nodes[1].raws.before || newline;
          }
        }
      } else {
        stylelint.utils.report({
          ruleName,
          result,
          node: root,
          message: messages.expected(expected),
        });
      }
    }
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
