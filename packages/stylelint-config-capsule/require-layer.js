"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.ruleName = void 0;
const stylelint_1 = __importDefault(require("stylelint"));
exports.ruleName = 'capsule-ui/require-layer';
/* eslint-enable no-unused-vars */
const utils = stylelint_1.default.utils;
exports.messages = utils.ruleMessages(exports.ruleName, {
    expected: (name) => `Expected '@layer ${name}' declaration.`,
});
function getLineEnding(root) {
    const css = root.source?.input.css;
    return typeof utils.getLineEnding === 'function'
        ? utils.getLineEnding(css)
        : css && css.includes('\r\n')
            ? '\r\n'
            : '\n';
}
function isString(value) {
    return typeof value === 'string';
}
function isStringArray(value) {
    return Array.isArray(value) && value.every(isString);
}
const rule = (options = {}, _secondaryOption, context) => {
    return (root, result) => {
        const validOptions = utils.validateOptions(result, exports.ruleName, {
            actual: options,
            possible: {
                name: [isString, isStringArray],
                names: [isString, isStringArray],
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
            const layers = rule.params.split(',').map((l) => l.trim()).filter(Boolean);
            if (expected.some((name) => layers.includes(name))) {
                hasLayer = true;
            }
        });
        if (!hasLayer) {
            const first = expected[0];
            if (context?.fix) {
                let insertAfter = null;
                const skip = new Set(['charset', 'import', 'namespace']);
                for (const node of root.nodes ?? []) {
                    if (node.type === 'comment' ||
                        (node.type === 'atrule' && skip.has(node.name))) {
                        insertAfter = node;
                        continue;
                    }
                    break;
                }
                if (insertAfter) {
                    insertAfter.after(`${newline}@layer ${first};${newline}`);
                }
                else {
                    root.prepend(`@layer ${first};${newline}`);
                    if (root.nodes[1]) {
                        root.nodes[1].raws.before = root.nodes[1].raws.before || newline;
                    }
                }
            }
            else {
                utils.report({
                    ruleName: exports.ruleName,
                    result,
                    node: root,
                    message: exports.messages.expected(first),
                });
            }
        }
    };
};
exports.default = stylelint_1.default.createPlugin(exports.ruleName, rule);
