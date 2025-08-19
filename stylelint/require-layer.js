const stylelint = require('stylelint');

/**
 * Stylelint rule enforcing a named `@layer` declaration.
 *
 * @param {{name?: string|string[], names?: string|string[]}} [options] configuration with
 * expected layer name(s) (default: "components").
 * @example
 * // stylelint config
 * {
 *   "rules": {
 *     "capsule-ui/require-layer": { "names": ["layer-a", "layer-b"] }
 *   }
 * }
 * // Missing layer will be auto-inserted when `--fix` is used.
 */
const ruleName = 'capsule-ui/require-layer';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (name) => `Expected '@layer ${name}' declaration.`,
});

function getLineEnding(root) {
  const css = root && root.source && root.source.input && root.source.input.css;
  if (
    stylelint.utils &&
    typeof stylelint.utils.getLineEnding === 'function'
  ) {
    return stylelint.utils.getLineEnding(css);
  }
  return css && css.includes('\r\n') ? '\r\n' : '\n';
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

module.exports = stylelint.createPlugin(ruleName, function (options = {}, _, context) {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: options,
      possible: {
        name: [String, isStringArray],
        names: [String, isStringArray],
      },
      optional: true,
    });
    if (!validOptions) {
      return;
    }

    let expected = options.names || options.name || 'components';
    if (!Array.isArray(expected)) {
      expected = [expected];
    }
    const newline = getLineEnding(root);

    let hasLayer = false;
    root.walkAtRules('layer', (rule) => {
      if (rule.parent !== root) {
        return;
      }
      const layers = rule.params
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
      if (expected.some((name) => layers.includes(name))) {
        hasLayer = true;
      }
    });

    if (!hasLayer) {
      const first = expected[0];
      if (context && context.fix) {
        let insertAfter = null;
        const skip = new Set(['charset', 'import', 'namespace']);

        for (const node of root.nodes || []) {
          if (
            node.type === 'comment' ||
            (node.type === 'atrule' && skip.has(node.name))
          ) {
            insertAfter = node;
            continue;
          }
          break;
        }

        if (insertAfter) {
          insertAfter.after(`${newline}@layer ${first};${newline}`);
        } else {
          root.prepend(`@layer ${first};${newline}`);
          if (root.nodes[1]) {
            root.nodes[1].raws.before = root.nodes[1].raws.before || newline;
          }
        }
      } else {
        stylelint.utils.report({
          ruleName,
          result,
          node: root,
          message: messages.expected(first),
        });
      }
    }
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
