import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// ─── Security Headers ────────────────────────────────────────────────────────
// Applied on every response. This covers the OWASP Top 10 header recommendations.
const securityHeaders = [
  {
    // Prevent clickjacking attacks (embedding this site in an iframe)
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Prevent MIME-type sniffing (stops browsers from guessing content type)
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Control how much referrer information is sent with requests
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Force HTTPS for 1 year (with subdomains), preload in browser HSTS lists
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    // Limit browser APIs accessible to this page (minimize attack surface)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  {
    // Content Security Policy — whitelist trusted sources only.
    // This is the most important header against XSS attacks.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: allow self + Next.js inline scripts + Firebase SDKs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.firebase.com",
      // Styles: allow self + inline (needed for CSS-in-JS)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: allow self + data URIs + Firebase Storage
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://firebasestorage.googleapis.com",
      // API connections: Firebase, Supabase, Google APIs
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://*.supabase.co https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseapp.com https://*.firebase.com",
      // Frames: deny all embedding
      "frame-ancestors 'none'",
      // Forms: only submit to same origin
      "form-action 'self'",
      // Only load base URI from self
      "base-uri 'self'",
    ].join('; '),
  },
  {
    // DNS prefetch control — prevent DNS leakage
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Prevent exposing Next.js version in headers (reduces fingerprinting)
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
