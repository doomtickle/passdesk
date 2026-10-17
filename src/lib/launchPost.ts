// Converts docs/launch-post.md to HTML at build time (see vite.config.ts and
// why/index.html). Never imported by browser code: markdown-it stays a
// devDependency, not a dependency, so it never ships in the site's bundle.
import MarkdownIt from 'markdown-it';

export const OWNER_MARKER = 'OWNER:';

export function hasOwnerMarker(markdown: string): boolean {
  return markdown.includes(OWNER_MARKER);
}

export function stripHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

// Links to an http(s) URL are marked external: opened in a new tab, with a
// visible "external-link" class (styled in why-article.css) and a
// screen-reader-only "(opens in new tab)" suffix. Relative/anchor links are
// left untouched.
export function renderLaunchPost(markdown: string): string {
  const md = new MarkdownIt({ html: false });
  const externalStack: boolean[] = [];

  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet('href') ?? '';
    const isExternal = /^https?:\/\//.test(href);
    externalStack.push(isExternal);
    if (isExternal) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
      token.attrJoin('class', 'external-link');
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  md.renderer.rules.link_close = () => {
    const isExternal = externalStack.pop();
    return isExternal ? '</a><span class="visually-hidden"> (opens in new tab)</span>' : '</a>';
  };

  return md.render(stripHtmlComments(markdown));
}
