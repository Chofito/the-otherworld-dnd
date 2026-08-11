import type { Metadata } from 'next';

export const SITE_NAME = 'Club The Otherworld';
export const DEFAULT_OG_IMAGE = '/icons/icon-512.png';

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return 'http://localhost:3000';
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function truncateOgText(text: string, max = 220): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function siteIcons(): NonNullable<Metadata['icons']> {
  return {
    icon: [
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-120.png', sizes: '120x120', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/apple-touch-icon.png',
      },
    ],
  };
}

type BuildArgs = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function buildPublicMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: BuildArgs): Metadata {
  const metadataBase = getMetadataBase();
  const url = path ? new URL(path, metadataBase).toString() : undefined;
  const absoluteImage = new URL(image, metadataBase).toString();

  return {
    metadataBase,
    title,
    description,
    applicationName: SITE_NAME,
    icons: siteIcons(),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: 'es_ES',
      images: [
        {
          url: absoluteImage,
          width: 512,
          height: 512,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [absoluteImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
