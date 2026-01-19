import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for updating team
const updateTeamSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
});

// GET /api/teams/[id] - Get team details with members
export async function GET(
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

    // Check if user is member of this team
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('team_id', id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get team with members
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 });
    }

    // Get members with profiles
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        *,
        profile:profiles(id, email, first_name, last_name, full_name)
      `)
      .eq('team_id', id)
      .order('joined_at', { ascending: true });

    return NextResponse.json({
      team,
      members: members || [],
      currentUserRole: membership.role,
    });

  } catch (error) {
    console.error('Error in GET /api/teams/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/teams/[id] - Update team (leader only)
export async function PATCH(
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

    // Check if user is leader
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('team_id', id)
      .single();

    if (!membership || membership.role !== 'leader') {
      return NextResponse.json({ error: 'Seul le leader peut modifier l\'équipe' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update(validationResult.data)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ team, message: 'Équipe mise à jour' });

  } catch (error) {
    console.error('Error in PATCH /api/teams/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Delete team (leader only)
export async function DELETE(
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

    // Check if user is leader
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('team_id', id)
      .single();

    if (!membership || membership.role !== 'leader') {
      return NextResponse.json({ error: 'Seul le leader peut supprimer l\'équipe' }, { status: 403 });
    }

    // Delete team (cascade will delete members and calendar entries)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Équipe supprimée' });

  } catch (error) {
    console.error('Error in DELETE /api/teams/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
