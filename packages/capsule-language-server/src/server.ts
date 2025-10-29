import { createConnection, TextDocuments, ProposedFeatures, CompletionItemKind, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import path from 'path';
import { loadVariantsFromDirectory, VariantMap } from './variant-loader';
import fs from 'fs';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let tokenNames: string[] = [];
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
  const coreDir = path.resolve(__dirname, '../../packages/core');
  variants = loadVariantsFromDirectory(coreDir, (file, error) => {
    connection.console.error(`Failed parsing variants for ${file}: ${error}`);
  });
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
