import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

import { CometTrail } from '@/components/background/comet-trail';
import { ParticleField } from '@/components/background/particle-field';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { site } from '@/content/site';
import { THEME_COLORS, themeInitScript } from '@/lib/theme';

import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}  ${site.role}`,
    template: `%s  ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name}  ${site.role}`,
    description: site.description,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name}  ${site.role}`,
    description: site.description,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: site.shortName,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_COLORS.dark,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme attribute is written by the pre-paint script below, so the
    // server markup will not match  that difference is intentional.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${archivo.variable} ${jetBrainsMono.variable}`}>
        <ThemeProvider>
          <ParticleField />
          <CometTrail />
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
