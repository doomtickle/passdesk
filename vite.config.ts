import { defineConfig } from 'vite';

// React's automatic JSX runtime via Vite's built-in esbuild transform.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
});
