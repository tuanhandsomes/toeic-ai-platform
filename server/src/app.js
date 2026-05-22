import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimit.js';
import { morganStream } from './utils/logger.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Trust 1 hop of reverse proxy (Render/Vercel inject X-Forwarded-For).
// Required for express-rate-limit to see the real client IP in production.
// Value 1 (not true) avoids X-Forwarded-For spoofing from arbitrary upstreams.
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // cho phép FE load audio/image cross-origin
  }),
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Defense-in-depth: 200 req/min/IP cho mọi endpoint. Route-specific limiters
// (authLimiter, aiLimiter) thắt chặt hơn ở các endpoint nhạy cảm.
app.use(generalLimiter);

// Pipe HTTP request logs through winston so dev + prod use the same logger.
// 'dev' format in development (colored compact), 'combined' (Apache) in production.
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: morganStream }));

// Serve static media files (audio, images) from server/public/
// URLs: /audio/ets-2026/test-01/E26-T01-01.mp3, /images/ets-2026/test-01/q01.jpg, etc.
app.use(
  express.static(path.join(__dirname, '../public'), {
    maxAge: env.NODE_ENV === 'production' ? '7d' : '0',
  }),
);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
