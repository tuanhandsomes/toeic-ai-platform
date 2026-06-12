import { describe, it, expect } from 'vitest';
import {
  PASSWORD_RULES,
  checkPassword,
  isValidPassword,
} from '../../src/utils/passwordRules.js';

describe('PASSWORD_RULES catalog', () => {
  it('contains 6 rules with id + label + test fn', () => {
    expect(PASSWORD_RULES).toHaveLength(6);
    PASSWORD_RULES.forEach((r) => {
      expect(r.id).toBeTruthy();
      expect(r.label).toBeTruthy();
      expect(typeof r.test).toBe('function');
    });
  });
});

describe('checkPassword — per-rule output', () => {
  it('empty string → all rules unmet', () => {
    const results = checkPassword('');
    expect(results.every((r) => !r.met)).toBe(true);
  });

  it('"abc" → length+maxLength+lowercase met, others unmet', () => {
    const r = Object.fromEntries(checkPassword('abc').map((x) => [x.id, x.met]));
    expect(r.length).toBe(false);
    expect(r.maxLength).toBe(true);
    expect(r.lowercase).toBe(true);
    expect(r.uppercase).toBe(false);
    expect(r.digit).toBe(false);
    expect(r.special).toBe(false);
  });

  it('"Strong1!" → all rules met', () => {
    const r = Object.fromEntries(
      checkPassword('Strong1!').map((x) => [x.id, x.met]),
    );
    expect(r.length).toBe(true);
    expect(r.maxLength).toBe(true);
    expect(r.uppercase).toBe(true);
    expect(r.lowercase).toBe(true);
    expect(r.digit).toBe(true);
    expect(r.special).toBe(true);
  });

  it('73-char password violates maxLength', () => {
    const long = 'A1!' + 'a'.repeat(70);
    const r = Object.fromEntries(checkPassword(long).map((x) => [x.id, x.met]));
    expect(long.length).toBe(73);
    expect(r.maxLength).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('rejects empty', () => {
    expect(isValidPassword('')).toBe(false);
  });

  it('rejects when one rule missing (no special char)', () => {
    expect(isValidPassword('Strong12')).toBe(false);
  });

  it('accepts when all rules met', () => {
    expect(isValidPassword('Strong1!')).toBe(true);
    expect(isValidPassword('P@ssword42')).toBe(true);
  });

  it('rejects when over 72 chars', () => {
    expect(isValidPassword('A1!' + 'a'.repeat(70))).toBe(false);
  });

  it('rejects when missing uppercase', () => {
    expect(isValidPassword('lowonly1!')).toBe(false);
  });
});
