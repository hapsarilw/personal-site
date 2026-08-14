import { escapeHtml, sanitiseUrl } from './escape';

/**
 * Inline markdown: `code`, **bold**, *italic*, and [links](url).
 * Applied after escaping, so the source can never inject raw HTML.
 */
export function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
      const safeHref = sanitiseUrl(href);
      if (!safeHref) return match;
      const external = /^https?:\/\//i.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${safeHref}"${attrs}>${label}</a>`;
    });
}
