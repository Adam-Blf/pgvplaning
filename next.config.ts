import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

const securityHeaders = [
  // ... (keep existing headers)
];

const nextConfig: NextConfig = {
  // ... (keep existing config)
};

export default withNextIntl(nextConfig);
