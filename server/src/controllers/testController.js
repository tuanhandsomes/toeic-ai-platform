import { testService } from '../services/testService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
};
