import { testService } from '../services/testService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const testController = {
  list: asyncHandler(async (req, res) => {
    const data = await testService.list(req.query);
    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await testService.getById(req.params.id, { mode: 'taking' });
    res.json({ success: true, data });
  }),
};
