import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
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

    // Check if user is member of this team
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .where('team_id', '==', id)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    const membership = membershipQuery.docs[0].data();

    // Get team with members
    const teamDoc = await adminDb.collection('teams').doc(id).get();

    if (!teamDoc.exists) {
      return NextResponse.json({ error: 'Équipe non trouvée' }, { status: 404 });
    }
    const team = { id: teamDoc.id, ...teamDoc.data() };

    // Get members with profiles
    const membersQuery = await adminDb.collection('team_members')
      .where('team_id', '==', id)
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

    const members = membersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));

    // Fetch profiles for members
    const userIds = members.map(m => m.user_id);
    const profiles: Record<string, unknown> = {};

    if (userIds.length > 0) {
      await Promise.all(userIds.map(async (uid) => {
        const pDoc = await adminDb.collection('profiles').doc(uid).get();
        if (pDoc.exists) {
          profiles[uid] = { id: pDoc.id, ...pDoc.data() };
        }
      }));
    }

    const membersWithProfiles = members.map(m => ({
      ...m,
      profile: profiles[m.user_id] || null
    }));

    return NextResponse.json({
      team,
      members: membersWithProfiles,
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

    // Check if user is leader
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .where('team_id', '==', id)
      .limit(1)
      .get();

    if (membershipQuery.empty || membershipQuery.docs[0].data().role !== 'leader') {
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

    const teamRef = adminDb.collection('teams').doc(id);
    await teamRef.update({
      ...validationResult.data,
      updated_at: new Date().toISOString()
    });

    const updatedTeamSnap = await teamRef.get();
    const updatedTeam = { id: updatedTeamSnap.id, ...updatedTeamSnap.data() };

    return NextResponse.json({ team: updatedTeam, message: 'Équipe mise à jour' });

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

    // Check if user is leader
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .where('team_id', '==', id)
      .limit(1)
      .get();

    if (membershipQuery.empty || membershipQuery.docs[0].data().role !== 'leader') {
      return NextResponse.json({ error: 'Seul le leader peut supprimer l\'équipe' }, { status: 403 });
    }

    // Delete team (cascade will delete members, we should do a batch delete in Firestore)
    const batch = adminDb.batch();

    // Delete members
    const membersQuery = await adminDb.collection('team_members').where('team_id', '==', id).get();
    membersQuery.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete team
    batch.delete(adminDb.collection('teams').doc(id));

    await batch.commit();

    return NextResponse.json({ message: 'Équipe supprimée' });

  } catch (error) {
    console.error('Error in DELETE /api/teams/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
