import { questionService } from '../services/questionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const questionController = {
  list: asyncHandler(async (req, res) => {
    const data = await questionService.list(req.query);
    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const question = await questionService.getById(req.params.id);
    res.json({ success: true, data: { question } });
  }),

  create: asyncHandler(async (req, res) => {
    const question = await questionService.create(req.body);
    res.status(201).json({ success: true, data: { question } });
  }),

  update: asyncHandler(async (req, res) => {
    const question = await questionService.update(req.params.id, req.body);
    res.json({ success: true, data: { question } });
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await questionService.remove(req.params.id);
    res.json({ success: true, data });
  }),

  importBulk: asyncHandler(async (req, res) => {
    const data = await questionService.importBulk(req.body);
    res.status(201).json({ success: true, data });
  }),
};
