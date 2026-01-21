import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/teams/invitations/[token] - Valider un token d'invitation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      );
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Valider l'invitation via la fonction SQL
    const { data: validation, error: validationError } = await adminClient
      .rpc('validate_invitation', { p_token: token })
      .single();

    if (validationError) {
      console.error('Error validating invitation:', validationError);
      return NextResponse.json(
        { error: 'Erreur lors de la validation' },
        { status: 500 }
      );
    }

    if (!validation.is_valid) {
      return NextResponse.json({
        valid: false,
        error: validation.error_message,
      });
    }

    return NextResponse.json({
      valid: true,
      team: {
        id: validation.team_id,
        name: validation.team_name,
        code: validation.team_code,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/teams/invitations/[token]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/teams/invitations/[token] - Accepter une invitation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour rejoindre une équipe' },
        { status: 401 }
      );
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà dans une équipe
    const { data: existingMembership } = await adminClient
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Vous êtes déjà membre d\'une équipe. Quittez votre équipe actuelle pour en rejoindre une autre.' },
        { status: 409 }
      );
    }

    // Valider l'invitation
    const { data: validation, error: validationError } = await adminClient
      .rpc('validate_invitation', { p_token: token })
      .single();

    if (validationError || !validation.is_valid) {
      return NextResponse.json({
        error: validation?.error_message || 'Invitation invalide',
      }, { status: 400 });
    }

    // Récupérer les infos de l'équipe pour les jours de congés par défaut
    const { data: team } = await adminClient
      .from('teams')
      .select('default_leave_days_employee')
      .eq('id', validation.team_id)
      .single();

    const defaultLeaveDays = team?.default_leave_days_employee || 25;

    // S'assurer que le profil existe
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
        });
    }

    // Ajouter l'utilisateur à l'équipe
    const { data: membership, error: memberError } = await adminClient
      .from('team_members')
      .insert({
        user_id: user.id,
        team_id: validation.team_id,
        role: 'member',
        employee_type: 'employee',
        annual_leave_days: defaultLeaveDays,
        leave_balance: defaultLeaveDays,
        leave_balance_year: new Date().getFullYear(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error joining team:', memberError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'adhésion à l\'équipe' },
        { status: 500 }
      );
    }

    // Incrémenter le compteur d'utilisation de l'invitation
    await adminClient.rpc('use_invitation', { p_token: token });

    // Mettre à jour le profil avec l'équipe actuelle
    await adminClient
      .from('profiles')
      .update({ current_team_id: validation.team_id })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: `Vous avez rejoint l'équipe "${validation.team_name}"`,
      team: {
        id: validation.team_id,
        name: validation.team_name,
        code: validation.team_code,
      },
      membership: {
        id: membership.id,
        role: membership.role,
      },
    });

  } catch (error) {
    console.error('Error in POST /api/teams/invitations/[token]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/invitations/[token] - Désactiver une invitation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est leader
    const { data: membership } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'leader') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Désactiver l'invitation
    const { error: updateError } = await adminClient
      .from('team_invitations')
      .update({ is_active: false })
      .eq('token', token)
      .eq('team_id', membership.team_id);

    if (updateError) {
      console.error('Error deactivating invitation:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la désactivation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation désactivée',
    });

  } catch (error) {
    console.error('Error in DELETE /api/teams/invitations/[token]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
