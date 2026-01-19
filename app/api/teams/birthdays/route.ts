import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET /api/teams/birthdays - Get team birthdays for calendar display
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get user's team
    const { data: membership } = await adminClient
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 404 });
    }

    // Get all team members with their birth dates
    const { data: members, error: membersError } = await adminClient
      .from('profiles')
      .select(`
        id,
        full_name,
        first_name,
        last_name,
        birth_date,
        team_members!inner (
          team_id
        )
      `)
      .eq('team_members.team_id', membership.team_id)
      .not('birth_date', 'is', null);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Transform to birthday format for calendar
    const birthdays = (members || []).map(profile => {
      const birthDate = new Date(profile.birth_date!);
      return {
        userId: profile.id,
        name: profile.first_name || profile.full_name || 'Membre',
        birthMonth: birthDate.getMonth() + 1, // 1-indexed
        birthDay: birthDate.getDate(),
        birthYear: birthDate.getFullYear(),
      };
    });

    return NextResponse.json({ birthdays });

  } catch (error) {
    console.error('Error in GET /api/teams/birthdays:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
