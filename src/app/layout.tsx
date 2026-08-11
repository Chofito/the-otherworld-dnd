import type { Metadata } from 'next';
import {
  Cinzel,
  Cormorant_Garamond,
  IBM_Plex_Sans,
  Marcellus,
  Nunito_Sans,
  Source_Sans_3,
} from 'next/font/google';
import { DEFAULT_THEME_ID } from '@/config/design-themes';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { buildPublicMetadata } from '@/lib/site-metadata';
import './globals.css';

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const nunito = Nunito_Sans({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

const marcellus = Marcellus({
  variable: '--font-marcellus',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const ibmPlex = IBM_Plex_Sans({
  variable: '--font-ibm-plex',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
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
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      data-theme={DEFAULT_THEME_ID}
      className={`${cinzel.variable} ${sourceSans.variable} ${cormorant.variable} ${nunito.variable} ${marcellus.variable} ${ibmPlex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
