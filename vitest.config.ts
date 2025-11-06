import { defineConfig } from 'vitest/config';
import { swc } from 'vitest/environments';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
  resolve: {
    alias: {
      '@domain': '/src/domain',
      '@application': '/src/application',
      '@interface': '/src/interface',
      '@infrastructure': '/src/infrastructure',
      '@config': '/src/config',
    },
  },
});
