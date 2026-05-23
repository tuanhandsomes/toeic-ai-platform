import { uploadService } from '../services/uploadService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadController = {
  audio: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('Thiếu file upload (field name: "file")');
    const result = await uploadService.uploadAudio(req.file);
    res.status(201).json({ success: true, data: result });
  }),

  image: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('Thiếu file upload (field name: "file")');
    const result = await uploadService.uploadImage(req.file);
    res.status(201).json({ success: true, data: result });
  }),
};
