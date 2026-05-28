import { contactService } from '../services/contactService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const contactController = {
  send: asyncHandler(async (req, res) => {
    await contactService.send(req.body);
    return ApiResponse.ok(res, { sent: true }, 'Đã gửi tin nhắn. Cảm ơn bạn!');
  }),
};
