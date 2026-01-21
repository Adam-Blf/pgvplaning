import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema pour créer une invitation
const createInvitationSchema = z.object({
  expiresIn: z.enum(['1h', '24h', '7d', '30d', 'never']).default('7d'),
  maxUses: z.number().min(1).max(100).nullable().optional(),
});

// Calcul de la date d'expiration
function getExpirationDate(expiresIn: string): Date {
  const now = new Date();
  switch (expiresIn) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'never':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

// POST /api/teams/invitations - Créer un lien d'invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est leader d'une équipe
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'Vous n\'êtes membre d\'aucune équipe' },
        { status: 403 }
      );
    }

    if (membership.role !== 'leader') {
      return NextResponse.json(
        { error: 'Seuls les chefs d\'équipe peuvent créer des invitations' },
        { status: 403 }
      );
    }

    // Parser le body
    const body = await request.json().catch(() => ({}));
    const validationResult = createInvitationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { expiresIn, maxUses } = validationResult.data;

    // Utiliser admin client pour créer l'invitation
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Créer l'invitation
    const { data: invitation, error: inviteError } = await adminClient
      .from('team_invitations')
      .insert({
        team_id: membership.team_id,
        created_by: user.id,
        expires_at: getExpirationDate(expiresIn).toISOString(),
        max_uses: maxUses || null,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'invitation' },
        { status: 500 }
      );
    }

    // Construire l'URL d'invitation
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const inviteUrl = `${baseUrl}/invite/${invitation.token}`;

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        token: invitation.token,
        url: inviteUrl,
        expiresAt: invitation.expires_at,
        maxUses: invitation.max_uses,
        useCount: invitation.use_count,
      },
      message: 'Lien d\'invitation créé',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teams/invitations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET /api/teams/invitations - Lister les invitations de l'équipe
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est leader
    const { data: membership, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership || membership.role !== 'leader') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer les invitations actives
    const { data: invitations, error: invitationsError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('team_id', membership.team_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error('Error in GET /api/teams/invitations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
