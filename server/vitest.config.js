import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'scripts', 'seeds'],
    globals: false,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/services/**/*.js',
        'src/utils/**/*.js',
        'src/middlewares/**/*.js',
        'src/validations/**/*.js',
      ],
      exclude: ['src/utils/logger.js', 'src/utils/ApiError.js', 'src/utils/ApiResponse.js'],
    },
  },
});
