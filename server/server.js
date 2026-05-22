import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`, {
      env: env.NODE_ENV,
    });
  });
};

start().catch((err) => {
  logger.error('Failed to start server', { err: err.message, stack: err.stack });
  process.exit(1);
});
