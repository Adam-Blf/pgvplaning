import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';

// Schema for joining a team
const joinTeamSchema = z.object({
  code: z.string()
    .length(8, 'Le code doit contenir 8 caractères')
    .regex(/^[A-Z0-9]+$/, 'Le code ne doit contenir que des lettres majuscules et chiffres'),
  employeeType: z.enum(['employee', 'executive']).default('employee'),
  customLeaveDays: z.number().min(0).max(60).optional(),
});

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
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Use admin client for database operations (bypasses RLS)
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuration serveur manquante. Contactez l\'administrateur.' },
        { status: 500 }
      );
    }

    // Ensure user profile exists (create if not)
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist (for users created before migration)
      const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return NextResponse.json(
          { error: 'Erreur lors de la création du profil utilisateur' },
          { status: 500 }
        );
      }
    }

    // Check if user already has a team
    const { data: existingMembership } = await adminClient
      .from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Vous êtes déjà membre d\'une équipe' },
        { status: 409 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = joinTeamSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code, employeeType, customLeaveDays } = validationResult.data;

    // Calculate leave days based on employee type
    const defaultLeaveDays = employeeType === 'executive' ? 30 : 25;
    const annualLeaveDays = customLeaveDays ?? defaultLeaveDays;

    // Find team by code
    const { data: team, error: teamError } = await adminClient
      .from('teams')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Code équipe invalide' },
        { status: 404 }
      );
    }

    // Add user as member with employee type and leave days
    const { data: membership, error: memberError } = await adminClient
      .from('team_members')
      .insert({
        user_id: user.id,
        team_id: team.id,
        role: 'member',
        employee_type: employeeType,
        annual_leave_days: annualLeaveDays,
        leave_balance: annualLeaveDays,
        leave_balance_year: new Date().getFullYear(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error joining team:', memberError);
      return NextResponse.json(
        { error: 'Erreur lors de la jonction à l\'équipe' },
        { status: 500 }
      );
    }

    // Update user's profile with current team
    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({ current_team_id: team.id })
      .eq('id', user.id);

    if (profileUpdateError) {
      // Rollback membership if profile update fails
      console.error('Error updating profile:', profileUpdateError);
      await adminClient.from('team_members').delete().eq('id', membership.id);
      return NextResponse.json(
        { error: 'Erreur lors de la configuration du profil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
      },
      membership,
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
