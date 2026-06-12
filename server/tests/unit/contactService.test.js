import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DNS BEFORE importing service
vi.mock('node:dns/promises', () => ({
  default: { resolveMx: vi.fn() },
  resolveMx: vi.fn(),
}));
vi.mock('../../src/services/emailService.js', () => ({
  emailService: { sendContactMessage: vi.fn() },
}));

const dns = (await import('node:dns/promises')).default;
const { contactService } = await import(
  '../../src/services/contactService.js'
);
const { emailService } = await import('../../src/services/emailService.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('contactService.send — MX check', () => {
  it('rejects when domain has no MX (ENOTFOUND)', async () => {
    const err = Object.assign(new Error('not found'), { code: 'ENOTFOUND' });
    dns.resolveMx.mockRejectedValue(err);
    await expect(
      contactService.send({
        name: 'A',
        email: 'a@fake-domain-zzz.com',
        message: 'hi',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('không tồn tại'),
    });
    expect(emailService.sendContactMessage).not.toHaveBeenCalled();
  });

  it('rejects when MX returns empty list', async () => {
    dns.resolveMx.mockResolvedValue([]);
    await expect(
      contactService.send({
        name: 'A',
        email: 'a@no-mx.com',
        message: 'hi',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('fail-open on transient DNS error (timeout etc.) — proceeds', async () => {
    dns.resolveMx.mockRejectedValue({ code: 'ETIMEOUT' });
    emailService.sendContactMessage.mockResolvedValue(true);
    const out = await contactService.send({
      name: 'A',
      email: 'a@gmail.com',
      message: 'hi',
    });
    expect(out).toEqual({ sent: true });
  });

  it('sends when MX is valid', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'aspmx.l.google.com' }]);
    emailService.sendContactMessage.mockResolvedValue(true);
    const out = await contactService.send({
      name: 'A',
      email: 'a@gmail.com',
      message: 'hi there',
    });
    expect(out).toEqual({ sent: true });
    expect(emailService.sendContactMessage).toHaveBeenCalledWith({
      name: 'A',
      email: 'a@gmail.com',
      message: 'hi there',
    });
  });
});

describe('contactService.send — emailService failure', () => {
  beforeEach(() => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx.gmail.com' }]);
  });

  it('throws 500 when emailService returns false', async () => {
    emailService.sendContactMessage.mockResolvedValue(false);
    await expect(
      contactService.send({
        name: 'A',
        email: 'a@gmail.com',
        message: 'hi',
      }),
    ).rejects.toMatchObject({
      statusCode: 500,
      message: expect.stringContaining('thử lại'),
    });
  });
});
