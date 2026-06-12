// Vitest global setup — set dummy env vars BEFORE any module under test
// imports config/env.js (which throws on missing required vars).
process.env.MONGODB_URI ??= 'mongodb://localhost:27017/test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
process.env.NODE_ENV ??= 'test';
