import fs from 'fs';
import path from 'path';

export interface VariantGroupMap { [attr: string]: string[] }
export interface VariantMap { [component: string]: VariantGroupMap }

const VARIANTS_BLOCK_REGEX = /variants\s*:\s*{([\s\S]*)}\s*(?=\s*,\s*\w+\s*:|\s*})/;

export function parseVariantsFromContent(content: string): VariantGroupMap {
  const match = content.match(VARIANTS_BLOCK_REGEX);
  if (!match) {
    return {};
  }

  const block = match[1];
  const groupRegex = /(\w+)\s*:\s*{([^}]*)}/g;
  const componentVariants: VariantGroupMap = {};
  let groupMatch: RegExpExecArray | null;

  while ((groupMatch = groupRegex.exec(block))) {
    const attr = groupMatch[1];
    const body = groupMatch[2];
    const valueRegex = /(\w+)\s*:/g;
    const values: string[] = [];
    let valueMatch: RegExpExecArray | null;

    while ((valueMatch = valueRegex.exec(body))) {
      values.push(valueMatch[1]);
    }

    componentVariants[attr] = values;
  }

  return componentVariants;
}

export function loadVariantsFromDirectory(
  coreDir: string,
  onError?: (file: string, error: unknown) => void
): VariantMap {
  const resolvedDir = path.resolve(coreDir);
  const result: VariantMap = {};
  let files: string[] = [];

  try {
    files = fs.readdirSync(resolvedDir).filter(file => file.endsWith('.recipe.js'));
  } catch {
    return result;
  }

  for (const file of files) {
    const component = 'caps-' + file.replace('.recipe.js', '');
    try {
      const content = fs.readFileSync(path.join(resolvedDir, file), 'utf8');
      const parsed = parseVariantsFromContent(content);
      if (Object.keys(parsed).length > 0) {
        result[component] = parsed;
      }
    } catch (error) {
      if (onError) {
        onError(file, error);
      }
    }
  }

  return result;
}
