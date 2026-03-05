import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';
import * as admin from 'firebase-admin';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// Fonction utilitaire pour valider un token
async function validateTokenInfo(token: string) {
  const invitationsQuery = await adminDb.collection('team_invitations')
    .where('token', '==', token)
    .limit(1)
    .get();

  if (invitationsQuery.empty) {
    return { valid: false, error: 'Invitation introuvable ou invalide' };
  }

  const invitationDoc = invitationsQuery.docs[0];
  const invitation = invitationDoc.data();

  if (!invitation.is_active) {
    return { valid: false, error: 'Cette invitation a été désactivée' };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { valid: false, error: 'Cette invitation a expiré' };
  }

  if (invitation.max_uses !== null && invitation.use_count >= invitation.max_uses) {
    return { valid: false, error: 'Le nombre maximum d\'utilisations a été atteint' };
  }

  const teamDoc = await adminDb.collection('teams').doc(invitation.team_id).get();
  if (!teamDoc.exists) {
    return { valid: false, error: 'L\'équipe associée n\'existe plus' };
  }
  const team = teamDoc.data();

  return {
    valid: true,
    invitationId: invitationDoc.id,
    teamId: invitation.team_id,
    teamName: team?.name,
    teamCode: team?.code,
    defaultLeaveDays: team?.default_leave_days_employee || 25
  };
}

// GET /api/teams/invitations/[token] - Valider un token d'invitation
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Rate limiting anti brute-force sur la validation de tokens
  const clientId = getClientIdentifier(request.headers);
  const rateLimitResult = checkRateLimit(`invite-validate:${clientId}`, RATE_LIMITS.teamJoin);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const { token } = await params;

    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      );
    }

    const validation = await validateTokenInfo(token);

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        error: validation.error,
      });
    }

    return NextResponse.json({
      valid: true,
      team: {
        id: validation.teamId,
        name: validation.teamName,
        code: validation.teamCode,
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

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Vous devez être connecté pour rejoindre une équipe' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const userName = decodedToken.name || '';

    // Vérifier que l'utilisateur n'est pas déjà dans une équipe
    const existingMembershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (!existingMembershipQuery.empty) {
      return NextResponse.json(
        { error: 'Vous êtes déjà membre d\'une équipe. Quittez votre équipe actuelle pour en rejoindre une autre.' },
        { status: 409 }
      );
    }

    // Valider l'invitation
    const validation = await validateTokenInfo(token);

    if (!validation.valid) {
      return NextResponse.json({
        error: validation.error || 'Invitation invalide',
      }, { status: 400 });
    }

    // S'assurer que le profil existe
    const profileDoc = await adminDb.collection('profiles').doc(userId).get();

    if (!profileDoc.exists) {
      const parts = userName.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      await adminDb.collection('profiles').doc(userId).set({
        email: userEmail,
        full_name: userName,
        first_name: firstName,
        last_name: lastName,
        current_team_id: null,
      });
    }

    // Ajouter l'utilisateur à l'équipe
    const membershipData = {
      user_id: userId,
      team_id: validation.teamId,
      role: 'member',
      employee_type: 'employee',
      annual_leave_days: validation.defaultLeaveDays,
      leave_balance: validation.defaultLeaveDays,
      leave_balance_year: new Date().getFullYear(),
      joined_at: new Date().toISOString()
    };

    const membershipRef = await adminDb.collection('team_members').add(membershipData);

    // Incrémenter le compteur d'utilisation de l'invitation (une seule fois via transaction atomique)
    if (validation.invitationId) {
      const invRef = adminDb.collection('team_invitations').doc(validation.invitationId);
      await adminDb.runTransaction(async (t) => {
        const doc = await t.get(invRef);
        if (doc.exists) {
          t.update(invRef, { use_count: (doc.data()?.use_count || 0) + 1 });
        }
      });
    }

    // Mettre à jour le profil avec l'équipe actuelle
    await adminDb.collection('profiles').doc(userId).update({ current_team_id: validation.teamId });

    return NextResponse.json({
      success: true,
      message: `Vous avez rejoint l'équipe "${validation.teamName}"`,
      team: {
        id: validation.teamId,
        name: validation.teamName,
        code: validation.teamCode,
      },
      membership: {
        id: membershipRef.id,
        role: membershipData.role,
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

    if (membershipQuery.empty || membershipQuery.docs[0].data().role !== 'leader') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    const membership = membershipQuery.docs[0].data();

    // Trouver l'invitation et la désactiver
    const invitationsQuery = await adminDb.collection('team_invitations')
      .where('token', '==', token)
      .where('team_id', '==', membership.team_id)
      .limit(1)
      .get();

    if (invitationsQuery.empty) {
      return NextResponse.json(
        { error: 'Invitation introuvable' },
        { status: 404 }
      );
    }

    await adminDb.collection('team_invitations').doc(invitationsQuery.docs[0].id).update({
      is_active: false
    });

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
