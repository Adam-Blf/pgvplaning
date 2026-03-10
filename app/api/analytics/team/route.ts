import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit, getIdentifier } from '@/lib/security/rate-limit';
import { parseSearchParams, analyticsQuerySchema } from '@/lib/security/validation';

// API route: GET /api/analytics/team?teamId=xxx&months=6
// Returns monthly stats for a team from Supabase (last N months)
export async function GET(request: Request) {
    // Rate limiting: 100 requests per minute per IP
    const id = getIdentifier(request);
    const rl = checkRateLimit(`analytics:${id}`, { maxRequests: 100, windowMs: 60_000 });
    if (!rl.success) {
        return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }, {
            status: 429,
            headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        });
    }

    // Validate query params
    const { searchParams } = new URL(request.url);
    const parsed = parseSearchParams(searchParams, analyticsQuerySchema);
    if (parsed.error) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { teamId, months } = parsed.data!;

    // Compute the start date (N months ago)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (months ?? 6));
    const startMonth = startDate.toISOString().split('T')[0].substring(0, 7) + '-01';

    const { data, error } = await supabaseAdmin
        .from('team_monthly_stats')
        .select('*')
        .eq('team_id', teamId)
        .gte('month', startMonth)
        .order('month', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stats: data || [] });
}
