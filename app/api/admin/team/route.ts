import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { z } from 'zod';

const updateTeamSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  defaultLeaveDays: z.number().min(0).max(60).optional(),
});

// PATCH /api/admin/team - Update team settings
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
    const superAdminQuery = await adminDb.collection('super_admins').where('email', '==', userEmail).limit(1).get();
    const isSuperAdmin = !superAdminQuery.empty;

    // Get user's team membership
    const membershipQuery = await adminDb.collection('team_members').where('user_id', '==', userId).limit(1).get();
    if (membershipQuery.empty) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 404 });
    }

    const membership = membershipQuery.docs[0].data();
    const isTeamAdmin = membership.role === 'admin' || membership.role === 'leader' || isSuperAdmin;

    if (!isTeamAdmin) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = updateTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, defaultLeaveDays } = validationResult.data;

    // Build update object
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (defaultLeaveDays !== undefined) updates.default_leave_days = defaultLeaveDays;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
    }

    // Update team
    const teamRef = adminDb.collection('teams').doc(membership.team_id);
    await teamRef.update(updates);

    const updatedTeamSnap = await teamRef.get();
    const updatedTeam = { id: updatedTeamSnap.id, ...updatedTeamSnap.data() };

    // If default leave days changed, update all members' leave days
    if (defaultLeaveDays !== undefined) {
      const teamMembersQuery = await adminDb.collection('team_members').where('team_id', '==', membership.team_id).get();
      const batch = adminDb.batch();
      teamMembersQuery.forEach(doc => {
        batch.update(doc.ref, {
          annual_leave_days: defaultLeaveDays,
          leave_balance: defaultLeaveDays,
        });
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: 'Équipe mise à jour',
    });

  } catch (error) {
    console.error('Error in PATCH /api/admin/team:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
