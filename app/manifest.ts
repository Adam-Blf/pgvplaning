import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Absencia - Gestion des Absences',
    short_name: 'Absencia',
    description: 'Solution professionnelle de gestion des plannings pour équipes et organisations',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c1222',
    theme_color: '#06b6d4',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    categories: ['productivity', 'utilities', 'business'],
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
