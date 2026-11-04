import type { NextConfig } from 'next';

const prod = process.env.NODE_ENV === 'production';
const siteHost = (() => {
  try {
    return new URL(process.env.SITE_URL ?? 'http://localhost:3000').host;
  } catch {
    return 'localhost:3000';
  }
})();

/**
 * CSP (SECURITY §7). Next's inline bootstrap scripts need either a per-request nonce (which makes every
 * page dynamic and loses static generation) or 'unsafe-inline'. We keep pages static and allow inline
 * scripts; everything else stays locked down: no third-party script hosts beyond Turnstile/GA, no
 * framing, no plugins, same-origin forms.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${prod ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://challenges.cloudflare.com${prod ? '' : ' ws:'}`,
  'frame-src https://challenges.cloudflare.com https://www.google.com',
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(prod && !siteHost.startsWith('localhost') ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: `/${process.env.CLOUDINARY_CLOUD_NAME || '*'}/**` }],
  },
  experimental: {
    // Server Actions: Origin must match the site (plus the dev host).
    serverActions: { allowedOrigins: [siteHost], bodySizeLimit: '1mb' },
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },
};

export default nextConfig;
