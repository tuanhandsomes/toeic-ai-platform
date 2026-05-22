/**
 * Standardised response helpers.:
 *   { success: true, data: {...}, message: "..." }
 *
 * Use these in controllers instead of inlining res.json() to keep shape
 * consistent across endpoints.
 *
 * Usage:
 *   import { ApiResponse } from '../utils/ApiResponse.js';
 *   return ApiResponse.ok(res, { user });
 *   return ApiResponse.created(res, { result });
 *   return ApiResponse.noContent(res);
 */
export const ApiResponse = {
  ok(res, data, message) {
    return res
      .status(200)
      .json({ success: true, data, ...(message && { message }) });
  },

  created(res, data, message) {
    return res
      .status(201)
      .json({ success: true, data, ...(message && { message }) });
  },

  noContent(res) {
    return res.status(204).send();
  },

  /**
   * Use only when you need to send a non-data success (e.g. just a message).
   * For data, prefer ok() / created().
   */
  message(res, message, status = 200) {
    return res.status(status).json({ success: true, message });
  },
};
