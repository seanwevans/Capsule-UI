import * as csstree from 'css-tree';

/* eslint-disable no-unused-vars */
export type Validator = (name: string, value: any) => void;
/* eslint-enable no-unused-vars */

export const validators: Record<string, Validator> = {
  color: (name, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Token '${name}' has invalid color value '${value}'`);
    }
    const match = csstree.lexer.matchProperty('color', value);
    if (match.error) {
      throw new Error(`Token '${name}' has invalid color value '${value}'`);
    }
  },
  dimension: (name, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Token '${name}' has invalid dimension value '${value}'`);
    }
    const isLength = csstree.lexer.matchType('length', value).error === null;
    const isPercent = csstree.lexer.matchType('percentage', value).error === null;
    if (!isLength && !isPercent) {
      throw new Error(`Token '${name}' has invalid dimension value '${value}'`);
    }
  },
  number: (name, value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`Token '${name}' has invalid number value '${value}'`);
    }
  },
  'font-size': (name, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Token '${name}' has invalid font-size value '${value}'`);
    }
    const match = csstree.lexer.matchProperty('font-size', value);
    if (match.error) {
      throw new Error(`Token '${name}' has invalid font-size value '${value}'`);
    }
  },
  'font-weight': (name, value) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`Token '${name}' has invalid font-weight value '${value}'`);
    }
    const match = csstree.lexer.matchProperty('font-weight', String(value));
    if (match.error) {
      throw new Error(`Token '${name}' has invalid font-weight value '${value}'`);
    }
  },
  duration: (name, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Token '${name}' has invalid duration value '${value}'`);
    }
    const isTime = csstree.lexer.matchType('time', value).error === null;
    if (!isTime) {
      throw new Error(`Token '${name}' has invalid duration value '${value}'`);
    }
  },
  shadow: (name, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Token '${name}' has invalid shadow value '${value}'`);
    }
    const match = csstree.lexer.matchProperty('box-shadow', value);
    if (match.error) {
      throw new Error(`Token '${name}' has invalid shadow value '${value}'`);
    }
  }
};
