import type { MetadataRoute } from 'next';

import { site } from '@/content/site';
import { THEME_COLORS } from '@/lib/theme';

/**
 * Served at /manifest.webmanifest. Generated rather than hand-written so the
 * name, description and theme colour cannot drift from the rest of the site —
 * the previous static file still advertised a different person entirely.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.role}`,
    short_name: site.shortName,
    description: site.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: THEME_COLORS.dark,
    theme_color: THEME_COLORS.dark,
    categories: ['business', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
