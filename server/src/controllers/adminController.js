import { adminService } from '../services/adminService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminController = {
  // Stats
  stats: asyncHandler(async (_req, res) => {
    const data = await adminService.stats();
    res.json({ success: true, data });
  }),

  // Users
  listUsers: asyncHandler(async (req, res) => {
    const data = await adminService.listUsers(req.query);
    res.json({ success: true, data });
  }),

  toggleUserLock: asyncHandler(async (req, res) => {
    const user = await adminService.toggleUserLock(
      req.params.id,
      req.body.isActive,
      req.user._id,
    );
    res.json({ success: true, data: { user } });
  }),

  // Questions
  listQuestions: asyncHandler(async (req, res) => {
    const data = await adminService.listQuestions(req.query);
    res.json({ success: true, data });
  }),

  getQuestion: asyncHandler(async (req, res) => {
    const question = await adminService.getQuestion(req.params.id);
    res.json({ success: true, data: { question } });
  }),

  createQuestion: asyncHandler(async (req, res) => {
    const question = await adminService.createQuestion(req.body);
    res.status(201).json({ success: true, data: { question } });
  }),

  updateQuestion: asyncHandler(async (req, res) => {
    const question = await adminService.updateQuestion(req.params.id, req.body);
    res.json({ success: true, data: { question } });
  }),

  deleteQuestion: asyncHandler(async (req, res) => {
    const data = await adminService.deleteQuestion(req.params.id);
    res.json({ success: true, data });
  }),

  importQuestions: asyncHandler(async (req, res) => {
    const data = await adminService.importQuestions(req.body);
    res.status(201).json({ success: true, data });
  }),

  // Tests
  listTests: asyncHandler(async (req, res) => {
    const data = await adminService.listTests(req.query);
    res.json({ success: true, data });
  }),

  getTest: asyncHandler(async (req, res) => {
    const test = await adminService.getTest(req.params.id);
    res.json({ success: true, data: { test } });
  }),

  createTest: asyncHandler(async (req, res) => {
    const test = await adminService.createTest(req.body, req.user._id);
    res.status(201).json({ success: true, data: { test } });
  }),

  updateTest: asyncHandler(async (req, res) => {
    const test = await adminService.updateTest(req.params.id, req.body);
    res.json({ success: true, data: { test } });
  }),

  deleteTest: asyncHandler(async (req, res) => {
    const data = await adminService.deleteTest(req.params.id);
    res.json({ success: true, data });
  }),
};
