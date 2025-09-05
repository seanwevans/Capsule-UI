const fs = require('fs');
const path = require('path');

function flattenTokens(obj, prefix = [], out = []) {
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    const value = obj[key];
    const newPrefix = [...prefix, key];
    if (value && typeof value === 'object') {
      if ('$value' in value) {
        const val = value['$value'];
        if (val && typeof val === 'object') {
          flattenTokens(val, newPrefix, out);
        } else {
          out.push(newPrefix.join('.'));
        }
      } else {
        flattenTokens(value, newPrefix, out);
      }
    }
  }
  return out;
}

function loadTokens() {
  try {
    const tokenPath = path.resolve(__dirname, '../../tokens/source/tokens.json');
    const data = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    return flattenTokens(data);
  } catch {
    return [];
  }
}

const tokenNames = loadTokens();

module.exports = {
  rules: {
    'no-unknown-token': {
      meta: {
        type: 'problem',
        docs: {
          description: 'disallow unknown design tokens in theme attribute'
        },
        schema: []
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (!node.name || node.name.name !== 'theme') return;
            const valNode = node.value;
            if (!valNode || valNode.type !== 'Literal') return;
            const value = valNode.value;
            if (typeof value === 'string' && !tokenNames.includes(value)) {
              context.report({ node: valNode, message: `'${value}' is not a valid design token` });
            }
          }
        };
      }
    }
  }
};
