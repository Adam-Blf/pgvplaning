import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/members - Get all team members for current user's team
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Get user's team membership
    const { data: membership } = await adminClient
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 404 });
    }

    // Check if user is super admin
    const { data: superAdmin } = await adminClient
      .from('super_admins')
      .select('email')
      .eq('email', user.email)
      .single();

    const isSuperAdmin = !!superAdmin;
    const isTeamAdmin = membership.role === 'admin' || membership.role === 'leader' || isSuperAdmin;

    // Get team info
    const { data: team } = await adminClient
      .from('teams')
      .select('*')
      .eq('id', membership.team_id)
      .single();

    // Get all members with profiles
    const { data: members, error: membersError } = await adminClient
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        employee_type,
        annual_leave_days,
        leave_balance,
        joined_at,
        profiles:user_id (
          email,
          full_name,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('team_id', membership.team_id)
      .order('joined_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    return NextResponse.json({
      team,
      members,
      currentUser: {
        id: user.id,
        email: user.email,
        role: membership.role,
        isTeamAdmin,
        isSuperAdmin,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/admin/members:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/admin/members - Update member role or remove member
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Check if user is super admin
    const { data: superAdmin } = await adminClient
      .from('super_admins')
      .select('email')
      .eq('email', user.email)
      .single();

    const isSuperAdmin = !!superAdmin;

    // Get user's team membership
    const { data: actorMembership } = await adminClient
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (!actorMembership && !isSuperAdmin) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const isTeamAdmin = actorMembership?.role === 'admin' || actorMembership?.role === 'leader' || isSuperAdmin;

    if (!isTeamAdmin) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, action } = body;

    if (!memberId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Get target member
    const { data: targetMember } = await adminClient
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (!targetMember) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });
    }

    // Verify same team (unless super admin)
    if (!isSuperAdmin && targetMember.team_id !== actorMembership?.team_id) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    switch (action) {
      case 'promote':
        // Cannot promote team leader
        if (targetMember.role === 'leader') {
          return NextResponse.json({ error: 'Action impossible sur le créateur' }, { status: 400 });
        }

        await adminClient
          .from('team_members')
          .update({ role: 'admin' })
          .eq('id', memberId);

        return NextResponse.json({ success: true, message: 'Membre promu admin' });

      case 'demote':
        // Only leader or super admin can demote
        if (targetMember.role === 'leader') {
          return NextResponse.json({ error: 'Impossible de rétrograder le créateur' }, { status: 400 });
        }

        if (actorMembership?.role !== 'leader' && !isSuperAdmin) {
          return NextResponse.json({ error: 'Seul le créateur peut rétrograder' }, { status: 403 });
        }

        await adminClient
          .from('team_members')
          .update({ role: 'member' })
          .eq('id', memberId);

        return NextResponse.json({ success: true, message: 'Admin rétrogradé' });

      case 'remove':
        // Cannot remove team leader
        if (targetMember.role === 'leader') {
          return NextResponse.json({ error: 'Impossible de supprimer le créateur' }, { status: 400 });
        }

        // Cannot remove yourself
        if (targetMember.user_id === user.id) {
          return NextResponse.json({ error: 'Utilisez "Quitter l\'équipe"' }, { status: 400 });
        }

        await adminClient
          .from('team_members')
          .delete()
          .eq('id', memberId);

        // Clear user's current team
        await adminClient
          .from('profiles')
          .update({ current_team_id: null })
          .eq('id', targetMember.user_id);

        return NextResponse.json({ success: true, message: 'Membre supprimé' });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in PATCH /api/admin/members:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
