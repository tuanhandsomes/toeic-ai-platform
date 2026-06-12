import { describe, it, expect } from 'vitest';
import { contactMessageSchema } from '../../src/validations/contactValidation.js';

const ok = {
  name: 'Nguyen Van A',
  email: 'a@gmail.com',
  message: 'I have a question about the platform.',
  website: '',
};

const validate = (body) => contactMessageSchema.validate(body);

describe('contactMessageSchema — happy path', () => {
  it('accepts complete valid form', () => {
    const { error } = validate(ok);
    expect(error).toBeUndefined();
  });

  it('lowercases + trims email', () => {
    const { value } = validate({ ...ok, email: '  TEST@GMAIL.COM  ' });
    expect(value.email).toBe('test@gmail.com');
  });

  it('trims name', () => {
    const { value } = validate({ ...ok, name: '   Trí   ' });
    expect(value.name).toBe('Trí');
  });

  it('strips unknown fields', () => {
    const { value } = validate({ ...ok, extra: 'should disappear' });
    expect(value.extra).toBeUndefined();
  });

  it('allows Vietnamese diacritics in name', () => {
    const { error } = validate({ ...ok, name: 'Đặng Hữu Phước' });
    expect(error).toBeUndefined();
  });
});

describe('contactMessageSchema — name validation', () => {
  it('rejects empty name', () => {
    const { error } = validate({ ...ok, name: '' });
    expect(error.details[0].message).toMatch(/họ và tên/i);
  });

  it('rejects 1-char name', () => {
    const { error } = validate({ ...ok, name: 'A' });
    expect(error.details[0].message).toMatch(/2 ký tự/);
  });

  it('rejects name with no letters (only digits)', () => {
    const { error } = validate({ ...ok, name: '12345' });
    expect(error.details[0].message).toMatch(/chứa chữ cái/);
  });

  it('rejects 101-char name', () => {
    const { error } = validate({ ...ok, name: 'A'.repeat(101) });
    expect(error.details[0].message).toMatch(/100 ký tự/);
  });
});

describe('contactMessageSchema — email validation', () => {
  it('rejects invalid format', () => {
    const { error } = validate({ ...ok, email: 'not-an-email' });
    expect(error).toBeDefined();
  });

  it('rejects TLD with digits (e.g. .c0m)', () => {
    // VALID_TLD_REGEX requires 2-24 letters; digits in TLD fail.
    const { error } = validate({ ...ok, email: 'a@example.c0m' });
    expect(error).toBeDefined();
  });

  it('rejects email with no TLD at all', () => {
    const { error } = validate({ ...ok, email: 'a@example' });
    expect(error).toBeDefined();
  });

  it('rejects disposable domain (mailinator)', () => {
    const { error } = validate({ ...ok, email: 'fake@mailinator.com' });
    expect(error.details[0].message).toMatch(/email thật|tạm thời/);
  });

  it('rejects disposable domain (tempmail.com)', () => {
    const { error } = validate({ ...ok, email: 'x@tempmail.com' });
    expect(error.details[0].message).toMatch(/email thật|tạm thời/);
  });

  it('rejects disposable local-part on real domain (trashmail@gmail.com)', () => {
    const { error } = validate({ ...ok, email: 'trashmail@gmail.com' });
    expect(error.details[0].message).toMatch(/email thật|tạm thời/);
  });

  it('rejects "noreply@gmail.com"', () => {
    const { error } = validate({ ...ok, email: 'noreply@gmail.com' });
    expect(error.details[0].message).toMatch(/email thật|tạm thời/);
  });

  it('rejects email over 254 chars', () => {
    const longLocal = 'a'.repeat(250);
    const { error } = validate({ ...ok, email: `${longLocal}@x.com` });
    expect(error.details[0].message).toMatch(/254/);
  });

  it('allows legit gmail addresses', () => {
    const { error } = validate({ ...ok, email: 'nguyen.van.a@gmail.com' });
    expect(error).toBeUndefined();
  });

  it('allows .vn TLD', () => {
    const { error } = validate({ ...ok, email: 'test@fpt.edu.vn' });
    expect(error).toBeUndefined();
  });
});

describe('contactMessageSchema — message validation', () => {
  it('rejects empty message', () => {
    const { error } = validate({ ...ok, message: '' });
    expect(error.details[0].message).toMatch(/nội dung/i);
  });

  it('rejects < 10 chars', () => {
    const { error } = validate({ ...ok, message: 'too short' });
    expect(error.details[0].message).toMatch(/10 ký tự/);
  });

  it('rejects > 2000 chars', () => {
    const { error } = validate({ ...ok, message: 'a'.repeat(2001) });
    expect(error.details[0].message).toMatch(/2000/);
  });
});

describe('contactMessageSchema — honeypot', () => {
  it('rejects when bot fills website field', () => {
    const { error } = validate({ ...ok, website: 'https://spam.com' });
    expect(error.details[0].message).toMatch(/không hợp lệ/i);
  });

  it('accepts empty website (user does not see it)', () => {
    const { error } = validate({ ...ok, website: '' });
    expect(error).toBeUndefined();
  });
});
