import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

// POST /api/teams/[id]/leave - Leave a team
export async function POST(
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

    // Get user's membership
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .where('team_id', '==', id)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json({ error: 'Vous n\'êtes pas membre de cette équipe' }, { status: 404 });
    }

    const membershipDoc = membershipQuery.docs[0];
    const membership = membershipDoc.data();

    // If user is leader, check if there are other leaders
    if (membership.role === 'leader') {
      const otherLeadersQuery = await adminDb.collection('team_members')
        .where('team_id', '==', id)
        .where('role', '==', 'leader')
        .get();

      const otherLeadersCount = otherLeadersQuery.docs.filter(d => d.data().user_id !== userId).length;

      if (otherLeadersCount === 0) {
        // Check if there are other members
        const otherMembersQuery = await adminDb.collection('team_members')
          .where('team_id', '==', id)
          .get();

        const otherMembersCount = otherMembersQuery.docs.filter(d => d.data().user_id !== userId).length;

        if (otherMembersCount > 0) {
          return NextResponse.json(
            { error: 'Vous êtes le seul leader. Désignez un autre leader avant de quitter ou supprimez l\'équipe.' },
            { status: 400 }
          );
        }

        // User is the only member, delete the team
        await adminDb.collection('teams').doc(id).delete();

        // Clear profile's current team
        await adminDb.collection('profiles').doc(userId).update({ current_team_id: null });

        return NextResponse.json({ message: 'Équipe supprimée car vous étiez le seul membre' });
      }
    }

    // Remove user from team
    await membershipDoc.ref.delete();

    // Clear profile's current team
    await adminDb.collection('profiles').doc(userId).update({ current_team_id: null });

    return NextResponse.json({ message: 'Vous avez quitté l\'équipe' });

  } catch (error) {
    console.error('Error in POST /api/teams/[id]/leave:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
