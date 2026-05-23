import { testService } from '../services/testService.js';
import { testImportService } from '../services/testImportService.js';
import { testMediaService } from '../services/testMediaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * adminView is enabled only when the caller is admin AND explicitly asks via
 * ?adminView=true. Guards against accidentally exposing unpublished tests to
 * regular users.
 */
const isAdminView = (req) => req.user?.role === 'admin' && req.query?.adminView === 'true';

export const testController = {
  list: asyncHandler(async (req, res) => {
    const adminView = isAdminView(req);
    const data = await testService.list(req.query, { adminView });
    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const adminView = isAdminView(req);
    const mode = adminView ? 'review' : 'taking';
    const data = await testService.getById(req.params.id, { mode, adminView });
    res.json({ success: true, data });
  }),

  // ─── Admin-only handlers (mounted with requireAdmin in routes) ─────────────

  create: asyncHandler(async (req, res) => {
    const test = await testService.create(req.body, req.user._id);
    res.status(201).json({ success: true, data: { test } });
  }),

  update: asyncHandler(async (req, res) => {
    const test = await testService.update(req.params.id, req.body);
    res.json({ success: true, data: { test } });
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await testService.remove(req.params.id);
    res.json({ success: true, data });
  }),

  /**
   * POST /tests/import — 1-click import of a full test bundle
   * (testInfo + 200 questions). Creates the Full Test + 7 Practice Sets +
   * inserts every question with audioUrl/imageUrl auto-filled per convention.
   */
  importBundle: asyncHandler(async (req, res) => {
    const data = await testImportService.importBundle(req.body, req.user._id);
    res.status(201).json({ success: true, data });
  }),

  /**
   * POST /tests/:id/upload-media — bulk upload audio + image files for a test.
   * BE uploads each file to Cloudinary then relinks the Question docs in this
   * test so audioUrl / imageUrl point at the CDN URLs.
   */
  uploadMedia: asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw ApiError.badRequest('Vui lòng chọn ít nhất 1 file để tải lên.');
    }
    const data = await testMediaService.uploadForTest(req.params.id, req.files);
    res.status(201).json({ success: true, data });
  }),
};
