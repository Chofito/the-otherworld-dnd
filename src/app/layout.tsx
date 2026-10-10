import type { Metadata } from 'next';
import {
  Alegreya_Sans,
  Cinzel,
  Cormorant_Garamond,
  Grenze_Gotisch,
  Nunito_Sans,
} from 'next/font/google';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { buildPublicMetadata } from '@/lib/site-metadata';
import { getSiteThemeId } from '@/lib/site-theme';
import './globals.css';

// Base theme (arcane) fonts are preloaded. Theme-only fonts load on demand:
// the browser fetches a face only when the active theme's CSS uses it.
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const nunito = Nunito_Sans({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const alegreyaSans = Alegreya_Sans({
  variable: '--font-alegreya-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
});

const grenze = Grenze_Gotisch({
  variable: '--font-grenze',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return buildPublicMetadata({
    title: dict.meta.homeOgTitle,
    description: dict.meta.description,
    path: '/',
  });
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const [locale, themeId] = await Promise.all([getLocale(), getSiteThemeId()]);

  return (
    <html
      lang={locale}
      data-theme={themeId}
      data-site-theme={themeId}
      className={`${cormorant.variable} ${nunito.variable} ${cinzel.variable} ${alegreyaSans.variable} ${grenze.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
