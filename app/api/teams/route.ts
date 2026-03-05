import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/server';
import { z } from 'zod';
import crypto from 'crypto';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';

// Schema for team creation - with separate leave days for employee vs executive (cadre)
const createTeamSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  description: z.string().max(200).optional(),
  sector: z.enum(['public', 'private']).default('public'),
  leaveDaysEmployee: z.number().min(0).max(60).default(25),
  leaveDaysExecutive: z.number().min(0).max(60).default(25),
});

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request.headers);
  const rateLimitResult = checkRateLimit(`teams:${clientId}`, RATE_LIMITS.teams);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    // Authentifier l'utilisateur via le token dans les headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Check if user already has a team
    const membersQuery = await adminDb
      .collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (!membersQuery.empty) {
      return NextResponse.json(
        { error: 'Vous êtes déjà membre d\'une équipe' },
        { status: 409 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, sector, leaveDaysEmployee, leaveDaysExecutive } = validationResult.data;

    // Create team (code généré avec crypto.randomBytes pour une entropie sécurisée)
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const teamRef = adminDb.collection('teams').doc();
    const teamData = {
      name,
      description: description || '',
      code,
      sector,
      default_leave_days_employee: leaveDaysEmployee,
      default_leave_days_executive: leaveDaysExecutive,
      created_by: userId,
      created_at: new Date().toISOString()
    };

    await teamRef.set(teamData);
    const team = { id: teamRef.id, ...teamData };

    // Validate that code was generated correctly (defensive programming)
    if (!team?.code || !/^[A-Z0-9]{8}$/.test(team.code)) {
      console.error('Invalid team code generated:', team?.code);
      // Rollback: delete the team
      await adminDb.collection('teams').doc(team.id).delete();
      return NextResponse.json(
        { error: 'Erreur lors de la génération du code équipe. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Add user as leader
    const membershipRef = adminDb.collection('team_members').doc();
    const membershipData = {
      user_id: userId,
      team_id: team.id,
      role: 'leader',
      employee_type: 'employee',
      annual_leave_days: leaveDaysEmployee,
      leave_balance: leaveDaysEmployee,
      leave_balance_year: new Date().getFullYear(),
      joined_at: new Date().toISOString()
    };

    await membershipRef.set(membershipData);
    const membership = { id: membershipRef.id, ...membershipData };

    // Update user's profile with current team
    const profileRef = adminDb.collection('profiles').doc(userId);
    await profileRef.set({ current_team_id: team.id }, { merge: true });

    return NextResponse.json({
      team,
      membership,
      message: 'Équipe créée avec succès',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teams:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET /api/teams - Get current user's team
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    const membersQuery = await adminDb
      .collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membersQuery.empty) {
      return NextResponse.json({ team: null, membership: null });
    }

    const membershipDoc = membersQuery.docs[0];
    const membershipData = membershipDoc.data();

    const teamDoc = await adminDb.collection('teams').doc(membershipData.team_id).get();
    const teamData = teamDoc.exists ? { id: teamDoc.id, ...teamDoc.data() } : null;

    return NextResponse.json({
      team: teamData,
      membership: {
        id: membershipDoc.id,
        role: membershipData.role,
        joined_at: membershipData.joined_at,
        employee_type: membershipData.employee_type,
        annual_leave_days: membershipData.annual_leave_days,
        leave_balance: membershipData.leave_balance,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/teams:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
