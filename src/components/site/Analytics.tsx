import Script from 'next/script';

const GA = process.env.NEXT_PUBLIC_GA_ID;

/** GA4, only when NEXT_PUBLIC_GA_ID is set (no Google Signals / ad features, per SECURITY §8). */
export function Analytics() {
  if (!GA || !/^G-[A-Z0-9]+$/.test(GA)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}
