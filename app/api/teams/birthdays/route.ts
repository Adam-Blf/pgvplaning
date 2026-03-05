import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

// GET /api/teams/birthdays - Get team birthdays for calendar display
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

    // Get user's team
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 404 });
    }

    const teamId = membershipQuery.docs[0].data().team_id;

    // Get all team members
    const teamMembersQuery = await adminDb.collection('team_members')
      .where('team_id', '==', teamId)
      .get();

    if (teamMembersQuery.empty) {
      return NextResponse.json({ birthdays: [] });
    }

    const userIds = teamMembersQuery.docs.map(doc => doc.data().user_id);

    const birthdays: Array<{
      userId: string;
      name: string;
      birthMonth: number;
      birthDay: number;
      birthYear: number;
    }> = [];

    const profileRefs = userIds.map(uid => adminDb.collection('profiles').doc(uid));

    // Fetch profiles 100 at a time to avoid limits, although Admin SDK getAll handles it well
    if (profileRefs.length > 0) {
      // Create chunks of 100
      const chunks = [];
      for (let i = 0; i < profileRefs.length; i += 100) {
        chunks.push(profileRefs.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        const profilesSnapshot = await adminDb.getAll(...chunk);

        profilesSnapshot.forEach(doc => {
          if (doc.exists) {
            const profile = doc.data();
            if (profile?.birth_date) {
              const birthDate = new Date(profile.birth_date);
              birthdays.push({
                userId: doc.id,
                name: profile.first_name || profile.full_name || 'Membre',
                birthMonth: birthDate.getMonth() + 1, // 1-indexed
                birthDay: birthDate.getDate(),
                birthYear: birthDate.getFullYear(),
              });
            }
          }
        });
      }
    }

    return NextResponse.json({ birthdays });

  } catch (error) {
    console.error('Error in GET /api/teams/birthdays:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
