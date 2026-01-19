import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateTeamSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  defaultLeaveDays: z.number().min(0).max(60).optional(),
});

// PATCH /api/admin/team - Update team settings
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
    const { data: membership } = await adminClient
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 404 });
    }

    const isTeamAdmin = membership.role === 'admin' || membership.role === 'leader' || isSuperAdmin;

    if (!isTeamAdmin) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = updateTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, defaultLeaveDays } = validationResult.data;

    // Build update object
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (defaultLeaveDays !== undefined) updates.default_leave_days = defaultLeaveDays;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
    }

    // Update team
    const { data: updatedTeam, error: updateError } = await adminClient
      .from('teams')
      .update(updates)
      .eq('id', membership.team_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating team:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    // If default leave days changed, update all members' leave days
    if (defaultLeaveDays !== undefined) {
      const { error: membersUpdateError } = await adminClient
        .from('team_members')
        .update({
          annual_leave_days: defaultLeaveDays,
          leave_balance: defaultLeaveDays,
        })
        .eq('team_id', membership.team_id);

      if (membersUpdateError) {
        console.error('Error updating members leave days:', membersUpdateError);
      }
    }

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: 'Équipe mise à jour',
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/team:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
