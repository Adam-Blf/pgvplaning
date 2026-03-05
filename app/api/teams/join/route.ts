import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';

// Schema for joining a team - simplified, uses team's default leave days
const joinTeamSchema = z.object({
  code: z.string()
    .length(8, 'Le code doit contenir 8 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne doit contenir que des lettres majuscules et chiffres'),
});

// Schema for checking a team code (step 1)
const checkCodeSchema = z.object({
  code: z.string()
    .length(8, 'Le code doit contenir 8 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne doit contenir que des lettres majuscules et chiffres'),
});

// GET /api/teams/join?code=XXXXXXXX - Check team code and get sector
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Code requis' },
      { status: 400 }
    );
  }

  // Validate code format
  const validationResult = checkCodeSchema.safeParse({ code: code.toUpperCase() });
  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.errors[0].message },
      { status: 400 }
    );
  }

  // Rate limiting
  const clientId = getClientIdentifier(request.headers);
  const rateLimitResult = checkRateLimit(`check:${clientId}`, RATE_LIMITS.teamJoin);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Find team by code
    const teamQuery = await adminDb.collection('teams').where('code', '==', code.toUpperCase()).limit(1).get();

    if (teamQuery.empty) {
      return NextResponse.json(
        { error: 'Code équipe invalide' },
        { status: 404 }
      );
    }
    interface TeamDoc {
      id: string;
      name: string;
      sector?: string;
      [key: string]: unknown;
    }

    const team = { id: teamQuery.docs[0].id, ...teamQuery.docs[0].data() } as TeamDoc;

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        sector: team.sector || 'public',
      },
    });

  } catch (error) {
    console.error('Error in GET /api/teams/join:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/teams/join - Join a team with code
export async function POST(request: NextRequest) {
  // Rate limiting to prevent brute force on team codes
  const clientId = getClientIdentifier(request.headers);
  const rateLimitResult = checkRateLimit(`join:${clientId}`, RATE_LIMITS.teamJoin);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

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
    const userName = decodedToken.name || '';

    // Parse and validate request body
    const body = await request.json();
    const validationResult = joinTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code } = validationResult.data;

    // Check if user already has a team
    const existingMembershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (!existingMembershipQuery.empty) {
      return NextResponse.json(
        { error: 'Vous êtes déjà membre d\'une équipe' },
        { status: 409 }
      );
    }

    // Ensure user profile exists (create if not)
    const profileDoc = await adminDb.collection('profiles').doc(userId).get();

    if (!profileDoc.exists) {
      // Extract first/last name from display name if possible
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

    // Find team by code (includes default_leave_days)
    const teamQuery = await adminDb.collection('teams')
      .where('code', '==', code.toUpperCase())
      .limit(1)
      .get();

    if (teamQuery.empty) {
      return NextResponse.json(
        { error: 'Code équipe invalide' },
        { status: 404 }
      );
    }

    interface TeamDoc {
      id: string;
      name: string;
      code: string;
      sector?: string;
      default_leave_days?: number;
      [key: string]: unknown;
    }

    const teamDoc = teamQuery.docs[0];
    const team = { id: teamDoc.id, ...teamDoc.data() } as TeamDoc;

    // Use team's default leave days (set by team creator)
    const annualLeaveDays = team.default_leave_days || 25;

    // Add user as member with team's default leave days
    const membershipData = {
      user_id: userId,
      team_id: team.id,
      role: 'member',
      employee_type: 'employee',
      annual_leave_days: annualLeaveDays,
      leave_balance: annualLeaveDays,
      leave_balance_year: new Date().getFullYear(),
      joined_at: new Date().toISOString()
    };

    const membershipRef = await adminDb.collection('team_members').add(membershipData);

    // Update user's profile with current team
    await adminDb.collection('profiles').doc(userId).update({ current_team_id: team.id });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        sector: team.sector || 'public',
      },
      membership: { id: membershipRef.id, ...membershipData },
      message: 'Vous avez rejoint l\'équipe avec succès',
    });

  } catch (error) {
    console.error('Error in POST /api/teams/join:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
