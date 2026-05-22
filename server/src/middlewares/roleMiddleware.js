import { ApiError } from "../utils/ApiError.js";

/**
 * Role-based access control middlewares.
 *   - authMiddleware: "who are you" (verify JWT, attach req.user)
 *   - roleMiddleware: "what can you do" (check req.user.role)
 *
 * Must be placed AFTER requireAuth in the middleware chain — relies on
 * req.user being populated.
 */

/**
 * Generic factory — accept any of the given roles.
 * Example: router.use(requireAuth, requireRole('admin', 'moderator'))
 */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Chưa xác thực"));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Yêu cầu quyền: ${roles.join(" hoặc ")}`));
    }
    next();
  };

/**
 * Shortcut for the most common case — admin-only routes.
 * Equivalent to requireRole('admin') but reads more clearly at call sites.
 */
export const requireAdmin = requireRole("admin");
