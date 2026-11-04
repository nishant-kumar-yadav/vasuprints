import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { business } from '@/config/business';
import { seoData } from '@/content/seo-data';
import { env } from '@/config/env';
import { indexable } from '@/lib/seo-env';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['600', '700', '800'],
});

const home = seoData['/'];

export function generateMetadata(): Metadata {
  const e = env();
  const verification: Metadata['verification'] = {
    ...(e.GOOGLE_SITE_VERIFICATION ? { google: e.GOOGLE_SITE_VERIFICATION } : {}),
    ...(e.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': e.BING_SITE_VERIFICATION } } : {}),
  };
  return {
    metadataBase: new URL(business.siteUrl),
    title: { default: home?.title ?? 'VasuPrint', template: '%s | VasuPrint' },
    description: home?.description,
    applicationName: 'VasuPrint',
    openGraph: { type: 'website', siteName: 'VasuPrint', locale: 'en_IN' },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false, email: false, address: false },
    verification,
    // Staging copies must never compete with the real site in search.
    robots: indexable() ? { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#102B46',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before paint so reveal animations never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
