import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { business } from '@/config/business';
import { seoData } from '@/content/seo-data';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['600', '700', '800'],
});

const home = seoData['/'];

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: home?.title ?? 'VasuPrint', template: '%s | VasuPrint' },
  description: home?.description,
  applicationName: 'VasuPrint',
  openGraph: { type: 'website', siteName: 'VasuPrint', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
};

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
