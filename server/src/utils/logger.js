import winston from "winston";
import { env } from "../config/env.js";

const isDev = env.NODE_ENV === "development";

/**
 * Centralised logger — utils/logger.js (winston).
 *
 * Two formats:
 * - Dev: colourised single line, easy to scan in terminal during npm run dev
 * - Prod: JSON per line, machine-parseable for log aggregators (Render dashboard,
 *         future Datadog/LogDNA integration)
 *
 * Only Console transport for now — Render free tier has ephemeral disk, so
 * writing to files would lose data on every redeploy. Stderr is captured by
 * Render's dashboard log viewer.
 */

const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: isDev ? "debug" : "info",
  format: isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
  // Prevent Node from exiting on logger.error() with an Error object
  exitOnError: false,
});

// Stream object for morgan to pipe HTTP request logs through winston.
// Strips the trailing newline morgan appends so log lines are clean.
export const morganStream = {
  write: (msg) => logger.http(msg.trim()),
};
