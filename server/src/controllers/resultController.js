import { resultService } from '../services/resultService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const resultController = {
  submit: asyncHandler(async (req, res) => {
    const result = await resultService.submit({
      userId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ success: true, data: { result } });
  }),

  list: asyncHandler(async (req, res) => {
    const data = await resultService.listForUser(req.user._id, req.query);
    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const result = await resultService.getByIdForUser(req.params.id, req.user._id);
    res.json({ success: true, data: { result } });
  }),
};
