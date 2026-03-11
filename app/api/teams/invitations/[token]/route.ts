import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';

/**
 * GET /api/teams/invitations/[token]
 * Vérifie la validité d'une invitation via son token.
 * Supporte les invitations classiques ET pré-créées.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const clientId = getClientIdentifier(request.headers);
  const rateLimitResult = checkRateLimit(`invite:${clientId}`, RATE_LIMITS.default);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    // Chercher par token field (les invitations utilisent un token UUID comme champ)
    const invitesQuery = await adminDb.collection('team_invitations')
      .where('token', '==', token)
      .where('is_active', '==', true)
      .limit(1)
      .get();

    if (invitesQuery.empty) {
      return NextResponse.json({ error: 'Invitation invalide', valid: false }, { status: 404 });
    }

    const inviteDoc = invitesQuery.docs[0];
    const inviteData = inviteDoc.data();

    // Vérifier expiration
    const expiresAt = inviteData.expires_at ? new Date(inviteData.expires_at) : null;
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expirée', valid: false }, { status: 410 });
    }

    // Vérifier max uses
    if (inviteData.max_uses && inviteData.use_count >= inviteData.max_uses) {
      return NextResponse.json({ error: 'Invitation déjà utilisée', valid: false }, { status: 410 });
    }

    // Récupérer infos équipe
    const teamDoc = await adminDb.collection('teams').doc(inviteData.team_id).get();
    const teamData = teamDoc.data();

    const response: Record<string, unknown> = {
      valid: true,
      team: {
        id: inviteData.team_id,
        name: teamData?.name || 'Équipe inconnue',
        code: teamData?.code || '',
      },
    };

    // Si pré-créée, inclure les données du membre
    if (inviteData.type === 'pre-created') {
      response.preCreated = true;
      response.memberData = {
        email: inviteData.email,
        firstName: inviteData.first_name,
        lastName: inviteData.last_name,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Invite GET Error:', error);
    return NextResponse.json({ error: 'Erreur serveur', valid: false }, { status: 500 });
  }
}

/**
 * POST /api/teams/invitations/[token]
 * Accepter une invitation (rejoindre l'équipe).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    // Auth check
    const authHeader = request.headers.get('Authorization');
    let userId: string;

    if (authHeader?.startsWith('Bearer ')) {
      const decodedToken = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
      userId = decodedToken.uid;
    } else if (auth) {
      // Try cookie-based auth
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    } else {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Find invitation
    const invitesQuery = await adminDb.collection('team_invitations')
      .where('token', '==', token)
      .where('is_active', '==', true)
      .limit(1)
      .get();

    if (invitesQuery.empty) {
      return NextResponse.json({ error: 'Invitation invalide' }, { status: 404 });
    }

    const inviteDoc = invitesQuery.docs[0];
    const inviteData = inviteDoc.data();

    // Check expiration
    const expiresAt = inviteData.expires_at ? new Date(inviteData.expires_at) : null;
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expirée' }, { status: 410 });
    }

    // Check if user already in a team
    const existingMembership = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (!existingMembership.empty) {
      return NextResponse.json({ error: 'Vous êtes déjà membre d\'une équipe' }, { status: 409 });
    }

    const teamId = inviteData.team_id;
    const memberDocId = `${teamId}_${userId}`;
    const role = inviteData.type === 'pre-created' ? (inviteData.role || 'member') : 'member';

    // Create team_member
    await adminDb.collection('team_members').doc(memberDocId).set({
      user_id: userId,
      team_id: teamId,
      role,
      status: 'pending',
      employee_type: 'cdi',
      weeklyHours: 38,
      joined_at: new Date().toISOString(),
    });

    // Update profile with team
    await adminDb.collection('profiles').doc(userId).update({
      teamId,
      role,
      updatedAt: new Date().toISOString(),
    });

    // If pre-created, update the pre_created_members doc
    if (inviteData.type === 'pre-created') {
      const preCreatedRef = adminDb.collection('pre_created_members').doc(token);
      const preCreatedDoc = await preCreatedRef.get();
      if (preCreatedDoc.exists) {
        await preCreatedRef.update({ status: 'registered', registeredUserId: userId });
      }
    }

    // Update invitation usage
    await inviteDoc.ref.update({
      use_count: (inviteData.use_count || 0) + 1,
      is_active: inviteData.max_uses ? (inviteData.use_count || 0) + 1 >= inviteData.max_uses ? false : true : true,
    });

    return NextResponse.json({
      success: true,
      teamId,
      message: 'Vous avez rejoint l\'équipe',
    });

  } catch (error) {
    console.error('Invite POST Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Needed for the auth check fallback
const auth = null;
