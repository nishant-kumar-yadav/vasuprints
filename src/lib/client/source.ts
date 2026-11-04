/** First-touch attribution kept for the browser session (UTM + landing page). Never leaves the device until a quote is sent. */
const KEY = 'vp-source';

export interface SourceInfo {
  landingPage: string;
  submitPage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

const clip = (v: string | null, n: number) => (v ?? '').slice(0, n);

export function captureSource() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const u = new URL(window.location.href);
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        landingPage: clip(u.pathname, 300),
        utmSource: clip(u.searchParams.get('utm_source'), 100),
        utmMedium: clip(u.searchParams.get('utm_medium'), 100),
        utmCampaign: clip(u.searchParams.get('utm_campaign'), 100),
      }),
    );
  } catch {
    /* storage unavailable */
  }
}

export function readSource(): SourceInfo {
  let s: Partial<SourceInfo> = {};
  try {
    s = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Partial<SourceInfo>;
  } catch {
    /* ignore */
  }
  return {
    landingPage: clip(s.landingPage ?? '', 300),
    submitPage: clip(window.location.pathname, 300),
    utmSource: clip(s.utmSource ?? '', 100),
    utmMedium: clip(s.utmMedium ?? '', 100),
    utmCampaign: clip(s.utmCampaign ?? '', 100),
  };
}
