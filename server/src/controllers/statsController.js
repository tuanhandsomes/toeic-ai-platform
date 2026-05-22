import { statsService } from '../services/statsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const statsController = {
  overview: asyncHandler(async (req, res) => {
    const data = await statsService.overview(req.user._id);
    res.json({ success: true, data });
  }),

  progress: asyncHandler(async (req, res) => {
    const data = await statsService.progress(req.user._id, req.query.range);
    res.json({ success: true, data });
  }),

  parts: asyncHandler(async (req, res) => {
    const data = await statsService.parts(req.user._id, req.query.testType);
    res.json({ success: true, data });
  }),
};
