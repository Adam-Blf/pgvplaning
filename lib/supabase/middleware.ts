import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Ne pas exécuter de code entre createServerClient et
  // supabase.auth.getUser(). Un simple await peut provoquer des bugs
  // difficiles à débugger.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes publiques accessibles sans connexion
  // L'application fonctionne en mode "guest" par défaut avec localStorage
  const publicRoutes = [
    '/',
    '/login',
    '/auth/callback',
    '/auth/confirm',
    '/setup',
    '/calendar',
    '/exports',
    '/settings',
    '/api',
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Routes qui nécessitent une connexion (fonctionnalités équipe)
  const protectedRoutes = ['/team-planner', '/team/members', '/team/settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Routes accessibles aux utilisateurs connectés sans équipe
  const noTeamRoutes = ['/team/setup', '/team/create', '/team/join', '/api/teams'];
  const isNoTeamRoute = noTeamRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si route protégée et pas connecté, rediriger vers login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Si utilisateur connecté et accède à une route team (pas noTeamRoute), vérifier équipe
  if (user && (isProtectedRoute || isNoTeamRoute) && !pathname.startsWith('/team/setup') && !pathname.startsWith('/team/create') && !pathname.startsWith('/team/join')) {
    // Vérifier si l'utilisateur a une équipe
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (!membership && isProtectedRoute) {
      // Pas d'équipe, rediriger vers team setup
      const url = request.nextUrl.clone();
      url.pathname = '/team/setup';
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: Vous *devez* retourner l'objet supabaseResponse tel quel.
  // Si vous créez un nouvel objet response avec NextResponse.next(),
  // assurez-vous de:
  // 1. Passer la request: NextResponse.next({ request })
  // 2. Copier les cookies: supabaseResponse.cookies.getAll()
  // 3. Changer l'objet supabaseResponse comme démontré ci-dessus

  return supabaseResponse;
}
