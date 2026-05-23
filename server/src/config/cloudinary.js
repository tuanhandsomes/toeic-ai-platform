import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let _configured = false;

/**
 * Lazy configure + return the singleton cloudinary SDK.
 * Returns null when credentials are missing — callers can fall back to
 * existing local paths during dev.
 *
 * Cloudinary chosen as media storage to avoid Render's
 * ephemeral disk and to get CDN edge delivery for free.
 */
export function getCloudinary() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    return null;
  }
  if (!_configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true, // always HTTPS URLs
    });
    _configured = true;
    logger.info("Cloudinary configured", { cloud: env.CLOUDINARY_CLOUD_NAME });
  }
  return cloudinary;
}
