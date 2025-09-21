import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', 
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    include: ['./tests/**/*.test.ts'], // Adjust the path if needed
  },
  plugins: [tsconfigPaths()],
});
