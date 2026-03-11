import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

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
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    // Vérifier que l'utilisateur est leader d'une équipe
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json(
        { error: 'Vous n\'êtes membre d\'aucune équipe' },
        { status: 403 }
      );
    }
    const membership = membershipQuery.docs[0].data();

    if (!['leader', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Seuls les chefs d\'équipe et modérateurs peuvent créer des invitations' },
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

    // Créer un token unique pour l'invitation
    const token = uuidv4();

    // Créer l'invitation
    const invitationData = {
      team_id: membership.team_id,
      created_by: userId,
      token,
      expires_at: getExpirationDate(expiresIn).toISOString(),
      max_uses: maxUses || null,
      use_count: 0,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const inviteRef = await adminDb.collection('team_invitations').add(invitationData);

    // Construire l'URL d'invitation (utiliser NEXT_PUBLIC_APP_URL en priorité pour éviter le spoofing du header Origin)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    return NextResponse.json({
      invitation: {
        id: inviteRef.id,
        token: token,
        url: inviteUrl,
        expiresAt: invitationData.expires_at,
        maxUses: invitationData.max_uses,
        useCount: invitationData.use_count,
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
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    // Vérifier que l'utilisateur est leader
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membershipQuery.empty || !['leader', 'moderator'].includes(membershipQuery.docs[0].data().role)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    const membership = membershipQuery.docs[0].data();

    // Récupérer les invitations actives
    const invitationsQuery = await adminDb.collection('team_invitations')
      .where('team_id', '==', membership.team_id)
      .where('is_active', '==', true)
      .orderBy('created_at', 'desc')
      .get();

    const invitations = invitationsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error('Error in GET /api/teams/invitations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
