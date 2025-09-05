// Capsule Token Sync Figma plugin
// Pulls design tokens from the local codebase and pushes changes back

const SERVER_URL = 'http://localhost:4141/tokens';

async function pull() {
  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error('Failed to fetch tokens');
    const src = await res.json();
    const tokens = flattenTokens(src);
    const themes = collectThemes(tokens);
    const collectionName = 'Capsule Tokens';
    let collection = figma.variables.getLocalVariableCollections().find(c => c.name === collectionName);
    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
    }
    const modes = ensureModes(collection, themes);
    const existing = figma.variables.getLocalVariables();
    for (const t of tokens) {
      const type = mapVariableType(t.type);
      let variable = existing.find(v => v.name === t.name && v.variableCollectionId === collection.id);
      if (!variable) {
        variable = figma.variables.createVariable(t.name, collection.id, type);
      }
      if (t.unit) {
        variable.description = t.unit;
      }
      if (typeof t.value === 'object') {
        for (const [theme, val] of Object.entries(t.value)) {
          variable.setValueForMode(modes[theme], convertToVariable(type, val));
        }
      } else {
        for (const modeId of Object.values(modes)) {
          variable.setValueForMode(modeId, convertToVariable(type, t.value));
        }
      }
    }
    figma.notify('Tokens pulled from code');
  } catch (err) {
    figma.notify(String(err));
  } finally {
    figma.closePlugin();
  }
}

async function push() {
  try {
    const collectionName = 'Capsule Tokens';
    const collection = figma.variables.getLocalVariableCollections().find(c => c.name === collectionName);
    if (!collection) throw new Error('No Capsule Tokens collection');
    const variables = figma.variables.getLocalVariables().filter(v => v.variableCollectionId === collection.id);
    const modeMap = {};
    for (const m of collection.modes) modeMap[m.modeId] = m.name;
    const tokens = {};
    for (const variable of variables) {
      const path = variable.name.split('/');
      const type = inferType(path[0]);
      const value = {};
      for (const [modeId, val] of Object.entries(variable.valuesByMode)) {
        value[modeMap[modeId]] = convertFromVariable(variable.resolvedType, val, variable.description);
      }
      const values = Object.values(value);
      const out = { $type: type, $value: values.length > 1 ? value : values[0] };
      setNested(tokens, path, out);
    }
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens, null, 2)
    });
    figma.notify('Tokens pushed to code');
  } catch (err) {
    figma.notify(String(err));
  } finally {
    figma.closePlugin();
  }
}

function flattenTokens(obj, path = []) {
  const out = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && '$type' in val) {
      const name = [...path, key].join('/');
      const unit = typeof val.$value === 'string' ? parseUnit(val.$value) : undefined;
      out.push({ name, type: val.$type, value: val.$value, unit });
    } else if (val && typeof val === 'object') {
      out.push(...flattenTokens(val, [...path, key]));
    }
  }
  return out;
}

function collectThemes(tokens) {
  const set = new Set();
  for (const t of tokens) {
    if (typeof t.value === 'object') {
      for (const k of Object.keys(t.value)) set.add(k);
    }
  }
  if (set.size === 0) set.add('light');
  return Array.from(set);
}

function ensureModes(collection, themes) {
  const modes = {};
  for (const theme of themes) {
    let mode = collection.modes.find(m => m.name === theme);
    if (!mode) mode = collection.addMode(theme);
    modes[theme] = mode.modeId;
  }
  return modes;
}

function mapVariableType(type) {
  switch (type) {
    case 'color':
      return 'COLOR';
    case 'dimension':
    case 'duration':
      return 'FLOAT';
    default:
      return 'STRING';
  }
}

function inferType(category) {
  switch (category) {
    case 'color':
      return 'color';
    case 'spacing':
    case 'radius':
      return 'dimension';
    case 'motion':
      return 'duration';
    default:
      return 'string';
  }
}

function convertToVariable(type, value) {
  if (type === 'COLOR') return parseColor(value);
  if (type === 'FLOAT') return parseFloat(value);
  return value;
}

function convertFromVariable(type, value, unit) {
  if (type === 'COLOR') return formatColor(value);
  if (type === 'FLOAT') return `${value}${unit || 'rem'}`;
  return String(value);
}

function parseColor(value) {
  if (value.startsWith('#')) {
    const r = parseInt(value.slice(1, 3), 16) / 255;
    const g = parseInt(value.slice(3, 5), 16) / 255;
    const b = parseInt(value.slice(5, 7), 16) / 255;
    return { r, g, b, a: 1 };
  }
  const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
  if (m) {
    const [, rs, gs, bs, as] = m;
    return {
      r: Number(rs) / 255,
      g: Number(gs) / 255,
      b: Number(bs) / 255,
      a: as === undefined ? 1 : Number(as)
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function formatColor({ r, g, b, a }) {
  const to255 = v => Math.round(v * 255);
  if (a !== 1) return `rgba(${to255(r)},${to255(g)},${to255(b)},${a})`;
  const toHex = v => to255(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function parseUnit(value) {
  const m = String(value).match(/^[\d.]+(.*)$/);
  return m ? m[1] : '';
}

function setNested(obj, path, value) {
  const last = path.pop();
  let cur = obj;
  for (const part of path) {
    cur[part] = cur[part] || {};
    cur = cur[part];
  }
  cur[last] = value;
}

if (figma.command === 'pull') pull();
else if (figma.command === 'push') push();
