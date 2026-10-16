import { defineConfig, loadEnv } from 'vite';

// React's automatic JSX runtime via Vite's built-in esbuild transform.
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, '.', 'VITE_');
    if (!env.VITE_WAITLIST_ENDPOINT) {
      console.warn(
        '\n[passdesk] VITE_WAITLIST_ENDPOINT is not set. The waitlist form will show a "sign-up isn\'t connected" message instead of submitting. See .env.example.\n',
      );
    }
  }

  return {
    esbuild: { jsx: 'automatic' },
  };
});
