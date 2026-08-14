const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

const WORDS_PER_MINUTE = 220;

export function countWords(text: string): number {
  return text.trim().match(/\S+/g)?.length ?? 0;
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(countWords(text) / WORDS_PER_MINUTE));
}

/**
 * Formats as `JUL 22 2026`. Uses UTC parts so the label never shifts with the
 * viewer's timezone — otherwise the server and client can disagree and React
 * reports a hydration mismatch.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()} ${date.getUTCFullYear()}`;
}

export function pluralise(count: number, singular: string, plural = `${singular}S`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
