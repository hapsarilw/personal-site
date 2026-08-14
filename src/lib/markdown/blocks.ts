export type Block =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; lines: string[] }
  | { type: 'code'; language: string; code: string }
  | { type: 'figure'; src: string; caption: string }
  | { type: 'video'; id: string }
  | { type: 'divider' };

const FENCE = /^```(\w*)\s*$/;
const HEADING = /^(#{1,4})\s+(.*)$/;
const UNORDERED_ITEM = /^[-*]\s+(.*)$/;
const ORDERED_ITEM = /^\d+\.\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const DIVIDER = /^-{3,}$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const YOUTUBE =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^\s]*&)?v=|embed\/|live\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})(?:[?&#][^\s]*)?$/;

export function extractYouTubeId(line: string): string | null {
  return YOUTUBE.exec(line.trim())?.[1] ?? null;
}

/**
 * Line-oriented block parser. Each branch either consumes a run of lines and
 * pushes one block, or falls through to a paragraph  so adding a block type
 * means adding one branch, not touching shared flush logic.
 */
export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = (lines[index] ?? '').trimEnd();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE.test(lines[index] ?? '')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1; // closing fence
      blocks.push({ type: 'code', language: fence[1] ?? '', code: code.join('\n') });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1]!.length as 1 | 2 | 3 | 4,
        text: heading[2] ?? '',
      });
      index += 1;
      continue;
    }

    const image = IMAGE.exec(line);
    if (image) {
      blocks.push({ type: 'figure', src: image[2] ?? '', caption: image[1] ?? '' });
      index += 1;
      continue;
    }

    const videoId = extractYouTubeId(line);
    if (videoId) {
      blocks.push({ type: 'video', id: videoId });
      index += 1;
      continue;
    }

    if (DIVIDER.test(line)) {
      blocks.push({ type: 'divider' });
      index += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const match = QUOTE.exec((lines[index] ?? '').trimEnd());
        if (!match) break;
        quoteLines.push(match[1] ?? '');
        index += 1;
      }
      blocks.push({ type: 'quote', lines: quoteLines });
      continue;
    }

    const listPattern = UNORDERED_ITEM.test(line)
      ? UNORDERED_ITEM
      : ORDERED_ITEM.test(line)
        ? ORDERED_ITEM
        : null;

    if (listPattern) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = listPattern.exec((lines[index] ?? '').trimEnd());
        if (!match) break;
        items.push(match[1] ?? '');
        index += 1;
      }
      blocks.push({ type: 'list', ordered: listPattern === ORDERED_ITEM, items });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
    index += 1;
  }

  return blocks;
}
