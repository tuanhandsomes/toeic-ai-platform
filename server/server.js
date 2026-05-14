import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`✓ Server listening on http://localhost:${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
  });
};

start().catch((err) => {
  console.error('✗ Failed to start server:', err);
  process.exit(1);
});
