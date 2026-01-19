import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/teams/[id]/leave - Leave a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get user's membership
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('team_id', id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Vous n\'êtes pas membre de cette équipe' }, { status: 404 });
    }

    // If user is leader, check if there are other leaders
    if (membership.role === 'leader') {
      const { data: otherLeaders } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', id)
        .eq('role', 'leader')
        .neq('user_id', user.id);

      if (!otherLeaders || otherLeaders.length === 0) {
        // Check if there are other members
        const { data: otherMembers } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', id)
          .neq('user_id', user.id);

        if (otherMembers && otherMembers.length > 0) {
          return NextResponse.json(
            { error: 'Vous êtes le seul leader. Désignez un autre leader avant de quitter ou supprimez l\'équipe.' },
            { status: 400 }
          );
        }

        // User is the only member, delete the team
        await supabase.from('teams').delete().eq('id', id);

        // Clear profile's current team
        await supabase
          .from('profiles')
          .update({ current_team_id: null })
          .eq('id', user.id);

        return NextResponse.json({ message: 'Équipe supprimée car vous étiez le seul membre' });
      }
    }

    // Remove user from team
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', membership.id);

    if (deleteError) {
      return NextResponse.json({ error: 'Erreur lors de la sortie de l\'équipe' }, { status: 500 });
    }

    // Clear profile's current team
    await supabase
      .from('profiles')
      .update({ current_team_id: null })
      .eq('id', user.id);

    return NextResponse.json({ message: 'Vous avez quitté l\'équipe' });

  } catch (error) {
    console.error('Error in POST /api/teams/[id]/leave:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
