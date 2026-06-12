import { describe, it, expect, vi } from 'vitest';
import multer from 'multer';
import {
  ALLOWED_AUDIO,
  ALLOWED_IMAGE,
  makeFilter,
  wrapMulter,
} from '../../src/middlewares/upload.js';

describe('Allowed mimetype sets', () => {
  it('AUDIO contains exactly MP3 mimetypes', () => {
    expect([...ALLOWED_AUDIO].sort()).toEqual(['audio/mp3', 'audio/mpeg']);
    expect(ALLOWED_AUDIO.has('audio/wav')).toBe(false);
    expect(ALLOWED_AUDIO.has('audio/ogg')).toBe(false);
  });

  it('IMAGE contains exactly PNG + JPEG', () => {
    expect([...ALLOWED_IMAGE].sort()).toEqual(['image/jpeg', 'image/png']);
    expect(ALLOWED_IMAGE.has('image/webp')).toBe(false);
    expect(ALLOWED_IMAGE.has('image/gif')).toBe(false);
  });
});

describe('makeFilter', () => {
  it('accepts allowed mimetype with cb(null, true)', () => {
    const filter = makeFilter(ALLOWED_AUDIO, 'audio');
    const cb = vi.fn();
    filter({}, { mimetype: 'audio/mpeg' }, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('rejects disallowed mimetype with ApiError 400', () => {
    const filter = makeFilter(ALLOWED_AUDIO, 'audio');
    const cb = vi.fn();
    filter({}, { mimetype: 'audio/wav' }, cb);
    expect(cb).toHaveBeenCalledOnce();
    const err = cb.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/audio\/wav/);
    expect(err.message).toMatch(/audio/);
  });

  it('uses provided "kind" label in error message', () => {
    const filter = makeFilter(ALLOWED_IMAGE, 'image');
    const cb = vi.fn();
    filter({}, { mimetype: 'image/webp' }, cb);
    expect(cb.mock.calls[0][0].message).toMatch(/image/);
  });
});

describe('wrapMulter — error translation', () => {
  it('passes through when no error', () => {
    const inner = (_req, _res, next) => next();
    const next = vi.fn();
    wrapMulter(inner)({}, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('LIMIT_FILE_SIZE → ApiError 400 with friendly message', () => {
    const err = new multer.MulterError('LIMIT_FILE_SIZE');
    const inner = (_req, _res, next) => next(err);
    const next = vi.fn();
    wrapMulter(inner)({}, {}, next);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 400,
      message: 'File vượt quá giới hạn kích thước cho phép',
    });
  });

  it('other MulterError → ApiError 400 with "Lỗi upload"', () => {
    const err = new multer.MulterError('LIMIT_FILE_COUNT');
    const inner = (_req, _res, next) => next(err);
    const next = vi.fn();
    wrapMulter(inner)({}, {}, next);
    const wrapped = next.mock.calls[0][0];
    expect(wrapped.statusCode).toBe(400);
    expect(wrapped.message).toMatch(/Lỗi upload/);
  });

  it('non-Multer error (e.g. ApiError from fileFilter) passes through unchanged', () => {
    const fileFilterErr = { statusCode: 400, message: 'Định dạng sai' };
    const inner = (_req, _res, next) => next(fileFilterErr);
    const next = vi.fn();
    wrapMulter(inner)({}, {}, next);
    expect(next).toHaveBeenCalledWith(fileFilterErr);
  });
});
