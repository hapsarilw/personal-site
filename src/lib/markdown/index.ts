import { parseBlocks } from './blocks';
import { renderBlocks } from './render';

/**
 * Renders post markdown to HTML.
 *
 * Runs at build time inside a server component, so the parser never ships to the
 * browser. Output is semantic HTML with class hooks only  all styling lives in
 * `prose.css`, which keeps the renderer free of presentation concerns.
 *
 * Supported beyond CommonMark basics:
 *   `![caption](src)` on its own line  → figure with caption, links to full size
 *   a bare YouTube URL on its own line → video preview card
 */
export function renderMarkdown(source: string): string {
  return renderBlocks(parseBlocks(source));
}
