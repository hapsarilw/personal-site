import type { Block } from './blocks';
import { escapeHtml, sanitiseUrl } from './escape';
import { highlight } from './highlight';
import { renderInline } from './inline';

function renderCode(language: string, code: string): string {
  const label = escapeHtml((language || 'text').toUpperCase());
  return [
    '<div class="code-block">',
    `<div class="code-block__label">${label}</div>`,
    `<pre><code>${highlight(code, language)}</code></pre>`,
    '</div>',
  ].join('');
}

function renderFigure(src: string, caption: string): string {
  const safeSrc = sanitiseUrl(src);
  if (!safeSrc) return '';

  const alt = escapeHtml(caption);
  const captionHtml = caption ? `<figcaption>${renderInline(caption)}</figcaption>` : '';

  return [
    '<figure>',
    `<a href="${safeSrc}" target="_blank" rel="noopener noreferrer">`,
    `<img src="${safeSrc}" alt="${alt}" loading="lazy" decoding="async" />`,
    '</a>',
    captionHtml,
    '</figure>',
  ].join('');
}

function renderVideo(id: string): string {
  const safeId = encodeURIComponent(id);
  const watchUrl = `https://www.youtube.com/watch?v=${safeId}`;
  const thumbnail = `https://img.youtube.com/vi/${safeId}/hqdefault.jpg`;

  return [
    `<a class="video-card" href="${watchUrl}" target="_blank" rel="noopener noreferrer"`,
    ` style="background-image:url('${thumbnail}')">`,
    '<span class="video-card__scrim"></span>',
    '<span class="video-card__play"></span>',
    '<span class="video-card__label">WATCH ON YOUTUBE</span>',
    '</a>',
  ].join('');
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'heading':
      return `<h${block.level}>${renderInline(block.text)}</h${block.level}>`;

    case 'paragraph':
      return `<p>${renderInline(block.text)}</p>`;

    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const items = block.items.map((item) => `<li>${renderInline(item)}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }

    case 'quote':
      return `<blockquote>${renderInline(block.lines.join(' '))}</blockquote>`;

    case 'code':
      return renderCode(block.language, block.code);

    case 'figure':
      return renderFigure(block.src, block.caption);

    case 'video':
      return renderVideo(block.id);

    case 'divider':
      return '<hr />';
  }
}

export function renderBlocks(blocks: Block[]): string {
  return blocks.map(renderBlock).join('');
}
