import { describe, it, expect, vi } from 'vitest';
import { ApiResponse } from '../../src/utils/ApiResponse.js';

// Helper to fake Express res
const mockRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.send = vi.fn(() => res);
  return res;
};

describe('ApiResponse.ok', () => {
  it('200 with success + data', () => {
    const res = mockRes();
    ApiResponse.ok(res, { user: { id: 1 } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { user: { id: 1 } },
    });
  });

  it('200 with success + data + message', () => {
    const res = mockRes();
    ApiResponse.ok(res, { foo: 1 }, 'Saved');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { foo: 1 },
      message: 'Saved',
    });
  });
});

describe('ApiResponse.created', () => {
  it('201 with success + data', () => {
    const res = mockRes();
    ApiResponse.created(res, { id: 99 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 99 },
    });
  });

  it('201 with message included', () => {
    const res = mockRes();
    ApiResponse.created(res, { id: 1 }, 'Created');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 1 },
      message: 'Created',
    });
  });
});

describe('ApiResponse.noContent', () => {
  it('204 with empty send', () => {
    const res = mockRes();
    ApiResponse.noContent(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
  });
});

describe('ApiResponse.message', () => {
  it('200 default status with just message', () => {
    const res = mockRes();
    ApiResponse.message(res, 'Hi');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Hi' });
  });

  it('custom status code', () => {
    const res = mockRes();
    ApiResponse.message(res, 'Processing', 202);
    expect(res.status).toHaveBeenCalledWith(202);
  });
});
