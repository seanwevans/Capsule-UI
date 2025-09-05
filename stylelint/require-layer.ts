import stylelint, {
  type RuleBase,
  type RuleContext,
  type Utils,
  type PostcssResult,
} from 'stylelint';
import type { Root, AtRule, Node } from 'postcss';

type Result = PostcssResult;

export interface RequireLayerOptions {
  name?: string | string[];
  names?: string | string[];
}

export const ruleName = 'capsule-ui/require-layer';
const utils: Utils & { getLineEnding?: (input: string) => string } = stylelint.utils;

export const messages = utils.ruleMessages(ruleName, {
  expected: (name: string) => `Expected '@layer ${name}' declaration.`,
});

function getLineEnding(root: Root): string {
  const css = root.source?.input.css;
  return typeof utils.getLineEnding === 'function'
    ? utils.getLineEnding(css)
    : css && css.includes('\r\n')
      ? '\r\n'
      : '\n';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

const rule: RuleBase<RequireLayerOptions> = (
  options = {},
  _secondaryOption,
  context: RuleContext,
) => {
  return (root: Root, result: Result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: options,
      possible: {
        name: [isString, isStringArray],
        names: [isString, isStringArray],
      },
      optional: true,
    } as any);

    if (!validOptions) {
      return;
    }

    let expected = options.names || options.name || 'components';
    if (!Array.isArray(expected)) {
      expected = [expected];
    }

    const newline = getLineEnding(root);
    let hasLayer = false;

    root.walkAtRules('layer', (rule: AtRule) => {
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
        let insertAfter: Node | null = null;
        const skip = new Set(['charset', 'import', 'namespace']);

        for (const node of root.nodes ?? []) {
          if (
            node.type === 'comment' ||
            (node.type === 'atrule' && skip.has((node as AtRule).name))
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
        utils.report({
          ruleName,
          result,
          node: root,
          message: messages.expected(first),
        });
      }
    }
  };
};

export default stylelint.createPlugin(ruleName, rule as any);
