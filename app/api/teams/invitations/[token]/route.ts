import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';

/**
 * GET /api/teams/invitations/[token]
 * Vérifie la validité d'une invitation via son token.
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
    const inviteDoc = await adminDb.collection('team_invitations').doc(token).get();

    if (!inviteDoc.exists) {
      return NextResponse.json({ error: 'Invitation invalide' }, { status: 404 });
    }

    const inviteData = inviteDoc.data();
    if (!inviteData) return NextResponse.json({ error: 'Invitation vide' }, { status: 404 });

    // Vérifier expiration
    if (inviteData.expiresAt.toDate() < new Date() || inviteData.used) {
      return NextResponse.json({ error: 'Invitation expirée ou déjà utilisée' }, { status: 410 });
    }

    // Récupérer infos équipe
    const teamDoc = await adminDb.collection('teams').doc(inviteData.teamId).get();
    const teamData = teamDoc.data();

    return NextResponse.json({
      teamName: teamData?.name || 'Équipe inconnue',
      role: inviteData.role,
    });

  } catch (error) {
    console.error('Invite GET Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
