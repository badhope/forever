import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['backend/core/**/*.test.ts', 'backend/core/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['backend/core/database/**', 'backend/core/knowledge/**'],
    },
  },
  resolve: {
    alias: {
      '@': '/workspace/forever/backend/core',
    },
  },
});
