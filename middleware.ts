/**
 * Middleware Next.js - Protection des routes
 * 
 * Ce middleware intercepte chaque requête entrante pour :
 * - Protéger les routes nécessitant une authentification
 * - Rediriger les utilisateurs non connectés vers /login
 * - Rediriger les utilisateurs connectés hors de /login
 */

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Récupérer le token de session Firebase depuis les cookies
  const session = request.cookies.get('firebase-token')?.value;

  // Liste des routes protégées nécessitant une authentification
  const protectedRoutes = ['/admin', '/team', '/settings', '/calendar', '/analytics', '/team-planner'];

  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Si l'utilisateur tente d'accéder à une route protégée sans session, rediriger vers /login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est déjà connecté et accède à /login, rediriger vers l'accueil
  if (request.nextUrl.pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Laisser passer la requête normalement
  return NextResponse.next();
}

// Configuration du matcher - Exclure les fichiers statiques et assets
export const config = {
  matcher: [
    /*
     * Intercepter toutes les requêtes SAUF celles commençant par :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     * - Fichiers du dossier public (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
