import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { CONTACT_EMAIL, PLACEHOLDER_CONTACT_EMAIL } from './src/config';
import { hasOwnerMarker, renderLaunchPost } from './src/lib/launchPost';

const rootDir = dirname(fileURLToPath(import.meta.url));
const launchPostPath = resolve(rootDir, 'docs/launch-post.md');

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
  if (hasOwnerMarker(readFileSync(launchPostPath, 'utf-8'))) {
    problems.push(`docs/launch-post.md still contains an "OWNER:" marker.`);
  }
  return problems;
}

// Renders docs/launch-post.md to HTML at build time and drops it into
// why/index.html in place of the LAUNCH_POST_HTML placeholder. The
// conversion (markdown-it) runs only in this Node process; no markdown
// library or runtime fetch ships to the browser.
function launchPostPlugin(): Plugin {
  return {
    name: 'passdesk-launch-post',
    transformIndexHtml(html, ctx) {
      if (!ctx.filename.replace(/\\/g, '/').endsWith('why/index.html')) return html;
      const articleHtml = renderLaunchPost(readFileSync(launchPostPath, 'utf-8'));
      return html.replace('<!--LAUNCH_POST_HTML-->', articleHtml);
    },
  };
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
    plugins: [launchPostPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(rootDir, 'index.html'),
          why: resolve(rootDir, 'why/index.html'),
        },
      },
    },
  };
});
