import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// GET /api/teams/leave-info - Get current user's leave balance info
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Use admin client for database operations
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Get user's team membership with leave info
    const { data: membership, error: memberError } = await adminClient
      .from('team_members')
      .select(`
        employee_type,
        annual_leave_days,
        leave_balance,
        leave_balance_year,
        team:teams(id, name)
      `)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        { error: 'Aucune équipe trouvée' },
        { status: 404 }
      );
    }

    const currentYear = new Date().getFullYear();
    let leaveBalance = membership.leave_balance;
    let needsReset = false;

    // Check if reset is needed (new year)
    if (membership.leave_balance_year < currentYear) {
      leaveBalance = membership.annual_leave_days;
      needsReset = true;

      // Update the balance in DB
      await adminClient
        .from('team_members')
        .update({
          leave_balance: membership.annual_leave_days,
          leave_balance_year: currentYear,
        })
        .eq('user_id', user.id);
    }

    // Calculate used days
    const usedDays = membership.annual_leave_days - leaveBalance;

    return NextResponse.json({
      employeeType: membership.employee_type,
      employeeTypeLabel: membership.employee_type === 'executive' ? 'Cadre' : 'Employé',
      annualLeaveDays: membership.annual_leave_days,
      leaveBalance: leaveBalance,
      usedDays: usedDays,
      year: currentYear,
      wasReset: needsReset,
      team: membership.team,
    });

  } catch (error) {
    console.error('Error in GET /api/teams/leave-info:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
