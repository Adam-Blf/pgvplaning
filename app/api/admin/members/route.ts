import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

// GET /api/admin/members - Get all team members for current user's team
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
    const userEmail = decodedToken.email;

    // Get user's team membership
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 404 });
    }
    const membership = membershipQuery.docs[0].data();

    // Check if user is super admin
    const superAdminQuery = await adminDb.collection('super_admins')
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    const isSuperAdmin = !superAdminQuery.empty;
    const isTeamAdmin = membership.role === 'admin' || membership.role === 'leader' || isSuperAdmin;

    // Get team info
    const teamDoc = await adminDb.collection('teams').doc(membership.team_id).get();
    const team = { id: teamDoc.id, ...teamDoc.data() };

    // Get all members
    const membersQuery = await adminDb.collection('team_members')
      .where('team_id', '==', membership.team_id)
      .orderBy('joined_at', 'asc')
      .get();

    interface TeamMember {
      id: string;
      user_id: string;
      team_id: string;
      role: string;
      joined_at: string;
      [key: string]: unknown;
    }

    const membersData = membersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));

    // Fetch profiles for members
    const userIds = membersData.map(m => m.user_id);
    const profiles: Record<string, unknown> = {};

    if (userIds.length > 0) {
      await Promise.all(userIds.map(async (uid) => {
        const pDoc = await adminDb.collection('profiles').doc(uid).get();
        if (pDoc.exists) {
          profiles[uid] = { id: pDoc.id, ...pDoc.data() };
        }
      }));
    }

    const members = membersData.map(m => ({
      ...m,
      profiles: profiles[m.user_id] || null
    }));

    return NextResponse.json({
      team,
      members,
      currentUser: {
        id: userId,
        email: userEmail,
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
    const userEmail = decodedToken.email;

    // Check if user is super admin
    const superAdminQuery = await adminDb.collection('super_admins')
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    const isSuperAdmin = !superAdminQuery.empty;

    // Get user's team membership
    const actorMembershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    const actorMembership = actorMembershipQuery.empty ? null : actorMembershipQuery.docs[0].data();

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
    const targetMemberDoc = await adminDb.collection('team_members').doc(memberId).get();

    if (!targetMemberDoc.exists) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });
    }
    const targetMember = targetMemberDoc.data()!;

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

        await targetMemberDoc.ref.update({ role: 'admin' });

        return NextResponse.json({ success: true, message: 'Membre promu admin' });

      case 'demote':
        // Only leader or super admin can demote
        if (targetMember.role === 'leader') {
          return NextResponse.json({ error: 'Impossible de rétrograder le créateur' }, { status: 400 });
        }

        if (actorMembership?.role !== 'leader' && !isSuperAdmin) {
          return NextResponse.json({ error: 'Seul le créateur peut rétrograder' }, { status: 403 });
        }

        await targetMemberDoc.ref.update({ role: 'member' });

        return NextResponse.json({ success: true, message: 'Admin rétrogradé' });

      case 'remove':
        // Cannot remove team leader
        if (targetMember.role === 'leader') {
          return NextResponse.json({ error: 'Impossible de supprimer le créateur' }, { status: 400 });
        }

        // Cannot remove yourself
        if (targetMember.user_id === userId) {
          return NextResponse.json({ error: 'Utilisez "Quitter l\'équipe"' }, { status: 400 });
        }

        await targetMemberDoc.ref.delete();

        // Clear user's current team (ignore errors if profile doesn't exist)
        try {
          await adminDb.collection('profiles').doc(targetMember.user_id).update({ current_team_id: null });
        } catch {
          // It's possible the user profile no longer exists
        }

        return NextResponse.json({ success: true, message: 'Membre supprimé' });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in PATCH /api/admin/members:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
