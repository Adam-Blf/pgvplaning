import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

// GET /api/teams/leave-info - Get current user's leave balance info
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

    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json(
        { error: 'Aucune équipe trouvée' },
        { status: 404 }
      );
    }

    const membershipDoc = membershipQuery.docs[0];
    const membership = membershipDoc.data();

    // Fetch team details separately since Firestore doesn't support joins
    const teamDoc = await adminDb.collection('teams').doc(membership.team_id).get();
    const teamData = teamDoc.exists ? teamDoc.data() : null;
    const team = teamData ? { id: teamDoc.id, name: teamData.name } : null;

    const currentYear = new Date().getFullYear();
    let leaveBalance = membership.leave_balance;
    let needsReset = false;

    // Check if reset is needed (new year)
    if (membership.leave_balance_year < currentYear) {
      try {
        await adminDb.runTransaction(async (t) => {
          const docRef = adminDb.collection('team_members').doc(membershipDoc.id);
          const doc = await t.get(docRef);

          if (doc.exists) {
            const data = doc.data()!;
            if (data.leave_balance_year < currentYear) {
              t.update(docRef, {
                leave_balance: data.annual_leave_days,
                leave_balance_year: currentYear
              });
              // This update will only show in the local variable for the response 
              // as this runs during the transaction block.
              leaveBalance = data.annual_leave_days;
              needsReset = true;
            } else {
              leaveBalance = data.leave_balance;
            }
          }
        });
      } catch (error) {
        console.error('Transaction error in leave-info reset:', error);
        // On transaction error, fallback to the existing values.
      }
    }

    const usedDays = membership.annual_leave_days - leaveBalance;

    return NextResponse.json({
      employeeType: membership.employee_type,
      employeeTypeLabel: membership.employee_type === 'executive' ? 'Cadre' : 'Employé',
      annualLeaveDays: membership.annual_leave_days,
      leaveBalance: leaveBalance,
      usedDays: usedDays,
      year: currentYear,
      wasReset: needsReset,
      team: team,
    });

  } catch (error) {
    console.error('Error in GET /api/teams/leave-info:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
