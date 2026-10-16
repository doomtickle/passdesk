import { defineConfig, loadEnv } from 'vite';
import { CONTACT_EMAIL, PLACEHOLDER_CONTACT_EMAIL } from './src/config';

// Launch guard: any non-development build fails while the site is still
// unconfigured, unless PASSDESK_ALLOW_UNCONFIGURED=1 (used by `npm run build:preview`).
function launchProblems(mode: string): string[] {
  const env = loadEnv(mode, '.', 'VITE_');
  const problems: string[] = [];
  if (!env.VITE_WAITLIST_ENDPOINT) {
    problems.push('VITE_WAITLIST_ENDPOINT is not set, so the waitlist form cannot submit (see .env.example).');
  }
  if (CONTACT_EMAIL === PLACEHOLDER_CONTACT_EMAIL) {
    problems.push(`CONTACT_EMAIL in src/config.ts is still the placeholder ${PLACEHOLDER_CONTACT_EMAIL}.`);
  }
  return problems;
}

// React's automatic JSX runtime via Vite's built-in esbuild transform.
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const problems = launchProblems(mode);
    if (problems.length > 0) {
      const list = problems.map((problem) => `  - ${problem}`).join('\n');
      if (mode !== 'development' && process.env.PASSDESK_ALLOW_UNCONFIGURED !== '1') {
        throw new Error(
          `\n[passdesk] Refusing to build for mode "${mode}":\n${list}\nFix these, or run \`npm run build:preview\` (PASSDESK_ALLOW_UNCONFIGURED=1) for a non-launch build.\n`,
        );
      }
      console.warn(`\n[passdesk] Building an unconfigured site:\n${list}\n`);
    }
  }

  return {
    esbuild: { jsx: 'automatic' },
  };
});
