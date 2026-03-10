import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://absencia.beloucif.com';

    // Liste des routes publiques
    const routes = [
        '',
        '/fr',
        '/en',
        '/fr/calendar',
        '/en/calendar',
        '/fr/guide',
        '/en/guide',
        '/fr/login',
        '/en/login',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' || route === '/fr' || route === '/en' ? 1 : 0.8,
    }));
}
