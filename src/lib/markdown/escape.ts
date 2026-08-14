const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Escapes only what is ambiguous inside element content. Quotes are left alone
 * so the syntax highlighter can match string literals on their real delimiters
 * rather than on entity references.
 */
export function escapeText(value: string): string {
  return value.replace(/[&<>]/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Post bodies are authored in this repo, so they are trusted — but markdown link
 * targets are the one place a stray `javascript:` URL would become an executable
 * attribute, so allow only the schemes we actually use.
 */
export function sanitiseUrl(url: string): string {
  const trimmed = url.trim();
  const isSafe =
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed);

  return isSafe ? escapeHtml(trimmed) : '';
}
