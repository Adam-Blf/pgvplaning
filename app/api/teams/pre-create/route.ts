import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const preCreateSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  weeklyHours: z.number().min(0).max(48).optional().default(38),
  role: z.enum(['member', 'moderator']).optional().default('member'),
});

// POST /api/teams/pre-create — Leader/mod pré-crée un membre
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Vérifier leader ou moderator
    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return NextResponse.json({ error: 'Aucune équipe' }, { status: 403 });
    }

    const membership = membershipQuery.docs[0].data();
    if (!['leader', 'moderator'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 });
    }

    const body = await request.json();
    const validation = preCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { email, firstName, lastName, weeklyHours, role } = validation.data;

    // Vérifier si l'email n'est pas déjà dans l'équipe
    const existingQuery = await adminDb.collection('pre_created_members')
      .where('teamId', '==', membership.team_id)
      .where('email', '==', email.toLowerCase())
      .where('status', '==', 'pending_registration')
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return NextResponse.json({ error: 'Cet email a déjà une invitation en attente' }, { status: 409 });
    }

    const token = uuidv4();
    const preCreatedData = {
      teamId: membership.team_id,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role,
      weeklyHours,
      createdBy: userId,
      status: 'pending_registration',
      token,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection('pre_created_members').doc(token).set(preCreatedData);

    // Also create a team_invitation for the invite flow
    await adminDb.collection('team_invitations').add({
      team_id: membership.team_id,
      created_by: userId,
      token,
      type: 'pre-created',
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      max_uses: 1,
      use_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    // Sécurise : jamais localhost
    if (baseUrl.includes('localhost')) {
      baseUrl = 'https://absencia.beloucif.com'; // fallback prod
    }
    const inviteUrl = `${baseUrl}/invite/${token}`;

    return NextResponse.json({
      success: true,
      token,
      url: inviteUrl,
      member: { email, firstName, lastName, role, weeklyHours },
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teams/pre-create:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/teams/pre-create — Liste les membres pré-créés en attente
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1]);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const membershipQuery = await adminDb.collection('team_members')
      .where('user_id', '==', decodedToken.uid)
      .limit(1)
      .get();

    if (membershipQuery.empty || !['leader', 'moderator'].includes(membershipQuery.docs[0].data().role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const teamId = membershipQuery.docs[0].data().team_id;
    const preCreatedQuery = await adminDb.collection('pre_created_members')
      .where('teamId', '==', teamId)
      .orderBy('createdAt', 'desc')
      .get();

    const preCreated = preCreatedQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ preCreated });
  } catch (error) {
    console.error('Error in GET /api/teams/pre-create:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
