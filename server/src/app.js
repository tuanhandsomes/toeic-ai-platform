import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // cho phép FE load audio/image cross-origin
  }),
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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
