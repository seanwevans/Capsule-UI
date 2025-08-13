const stylelint = require('stylelint');

const ruleName = 'capsule-ui/require-layer';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected '@layer components' declaration.",
});

module.exports = stylelint.createPlugin(ruleName, function () {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {});
    if (!validOptions) {
      return;
    }

    let hasLayer = false;
    root.walkAtRules('layer', (rule) => {
      if (rule.params.trim() === 'components') {
        hasLayer = true;
      }
    });

    if (!hasLayer) {
      stylelint.utils.report({
        ruleName,
        result,
        node: root,
        message: messages.expected,
      });
    }
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
