import { createConnection, TextDocuments, ProposedFeatures, CompletionItemKind, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import fs from 'fs';
import path from 'path';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let tokenNames: string[] = [];
interface VariantMap { [component: string]: { [attr: string]: string[] } }
let variants: VariantMap = {};

function flattenTokens(obj: any, prefix: string[] = []) {
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    const value = obj[key];
    const newPrefix = [...prefix, key];
    if (value && typeof value === 'object') {
      if ('$value' in value) {
        const val = value['$value'];
        if (val && typeof val === 'object') {
          flattenTokens(val, newPrefix);
        } else {
          tokenNames.push(newPrefix.join('.'));
        }
      } else {
        flattenTokens(value, newPrefix);
      }
    }
  }
}

function loadTokens() {
  const tokenPath = path.resolve(__dirname, '../../tokens/source/tokens.json');
  try {
    const raw = fs.readFileSync(tokenPath, 'utf8');
    const data = JSON.parse(raw);
    tokenNames = [];
    flattenTokens(data);
  } catch (err) {
    connection.console.error(`Failed to load tokens: ${err}`);
  }
}

function loadVariants() {
  variants = {};
  const coreDir = path.resolve(__dirname, '../../packages/core');
  let files: string[] = [];
  try {
    files = fs.readdirSync(coreDir).filter(f => f.endsWith('.recipe.js'));
  } catch {
    return;
  }
  for (const file of files) {
    const component = 'caps-' + file.replace('.recipe.js', '');
    try {
      const content = fs.readFileSync(path.join(coreDir, file), 'utf8');
      const variantsBlock = content.match(/variants\s*:\s*{([\s\S]*?)}\s*,\s*defaultVariants/);
      if (!variantsBlock) continue;
      const block = variantsBlock[1];
      const groupRegex = /(\w+)\s*:\s*{([^}]*)}/g;
      let gMatch;
      variants[component] = {};
      while ((gMatch = groupRegex.exec(block))) {
        const attr = gMatch[1];
        const body = gMatch[2];
        const valueRegex = /(\w+)\s*:/g;
        let vMatch;
        const values: string[] = [];
        while ((vMatch = valueRegex.exec(body))) {
          values.push(vMatch[1]);
        }
        variants[component][attr] = values;
      }
    } catch (err) {
      connection.console.error(`Failed parsing variants for ${file}: ${err}`);
    }
  }
}

connection.onInitialize(() => {
  loadTokens();
  loadVariants();
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { resolveProvider: false, triggerCharacters: ['"', "'", ' ', '='] }
    }
  };
});

connection.onCompletion((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  const text = doc.getText({ start: { line: 0, character: 0 }, end: params.position });

  const themeMatch = /theme\s*=\s*"([^"}]*)$/.exec(text) || /theme\s*=\s*'([^']*)$/.exec(text);
  if (themeMatch) {
    return tokenNames.map(t => ({ label: t, kind: CompletionItemKind.Constant }));
  }

  const attrMatch = /<([a-zA-Z0-9-]+)[^>]*?(\w+)="[^"']*$/.exec(text);
  if (attrMatch) {
    const [, comp, attr] = attrMatch;
    const compVars = variants[comp];
    if (compVars && compVars[attr]) {
      return compVars[attr].map(v => ({ label: v, kind: CompletionItemKind.Value }));
    }
  }

  return [];
});

documents.listen(connection);
connection.listen();
