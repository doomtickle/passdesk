// Entry for why/index.html. The article HTML itself is rendered at build time
// from docs/launch-post.md (see vite.config.ts); this file only wires up the
// same self-hosted fonts and shared styles the homepage uses.
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource/jetbrains-mono/400.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/why-article.css';
