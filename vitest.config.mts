import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Runs the Next-only unit tests in src/ and the contract tests, which check
// the port against output recorded from the original Vue app
// (docs/adr/0009, docs/adr/0017). @contract-target is the port's adapter; the
// recorder in the Vue app's folder points it at the Vue components instead.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@contract-target': path.resolve(
        import.meta.dirname,
        'tests/contracts/next/target.tsx',
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/contracts/specs/**/*.contract.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
