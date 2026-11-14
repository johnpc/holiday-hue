/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: ['es2020', 'chrome67', 'safari14', 'firefox68', 'edge79'],
    rollupOptions: {
      output: {
        // Heavy vendors in their own long-cached chunks.
        manualChunks: {
          amplify: ['aws-amplify'],
          ionic: ['@ionic/react', '@ionic/react-router', 'ionicons'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    testTimeout: 15000,
    // Acceptance tests live in e2e/ and run under Playwright, not Vitest.
    exclude: ['node_modules', 'dist', 'e2e', '.features-gen', '.git', '.claude', 'ios', 'android'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      // Measure EVERY logic file — app, backend helpers, and the umbrel runner.
      all: true,
      include: ['src/**/*.{ts,tsx}', 'amplify/**/*.ts', 'runner/**/*.ts'],
      // Excluded: tests, type decls, setup, declarative amplify config, fixture
      // DATA, and the side-effecting runner entrypoints (their logic lives in
      // tested helpers). Fix low coverage with tests, never an exclusion.
      exclude: [
        '**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/setupTests.ts',
        'src/main.tsx',
        'src/lib/amplify.ts',
        'amplify/**/resource.ts',
        'amplify/backend.ts',
        'amplify/seed/fixtures/**',
        'amplify/seed/seed.ts',
        'runner/main.ts',
      ],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
