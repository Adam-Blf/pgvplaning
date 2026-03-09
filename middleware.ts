import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Exécuter le middleware d'internationalisation
  const response = intlMiddleware(request);

  // 2. Récupérer le token de session Firebase depuis les cookies
  const session = request.cookies.get('firebase-token')?.value;

  // Liste des routes protégées (sans le préfixe de locale pour la vérification simple)
  const protectedRoutes = ['/admin', '/team', '/settings', '/calendar', '/analytics', '/team-planner'];

  // Extraire le pathname sans la locale
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';

  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Si l'utilisateur tente d'accéder à une route protégée sans session, rediriger vers /login
  if (isProtectedRoute && !session) {
    // On conserve la locale pour la redirection
    const locale = pathname.split('/')[1] || 'fr';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est déjà connecté et accède à /login, rediriger vers l'accueil (avec locale)
  if (pathnameWithoutLocale.startsWith('/login') && session) {
    const locale = pathname.split('/')[1] || 'fr';
    return NextResponse.redirect(new URL(`/${locale}/`, request.url));
  }

  // Retourner la réponse du middleware intl (qui contient les headers de locale)
  return response;
}

export const config = {
  // Matcher mis à jour pour inclure les locales
  matcher: ['/', '/(fr|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
