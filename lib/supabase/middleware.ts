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

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/auth/callback', '/auth/confirm', '/setup'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Routes accessibles aux utilisateurs connectés sans équipe
  const noTeamRoutes = ['/team/setup', '/team/create', '/team/join', '/api/teams'];
  const isNoTeamRoute = noTeamRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!user && !isPublicRoute) {
    // Pas d'utilisateur, rediriger vers login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si utilisateur connecté, vérifier s'il a une équipe
  if (user && !isPublicRoute && !isNoTeamRoute) {
    // Vérifier si l'utilisateur a une équipe
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
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
