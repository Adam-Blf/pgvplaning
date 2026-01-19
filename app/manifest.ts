import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PGV Planning - Gestion Hospitalière',
    short_name: 'PGV Planning',
    description: 'Solution professionnelle de gestion des plannings pour le secteur hospitalier',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c1222',
    theme_color: '#06b6d4',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    categories: ['productivity', 'utilities', 'medical'],
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
