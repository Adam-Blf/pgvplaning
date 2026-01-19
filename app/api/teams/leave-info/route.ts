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

    // Check if reset is needed (new year) - use atomic conditional update to prevent race condition
    if (membership.leave_balance_year < currentYear) {
      // Atomic update: only update if year is still old (prevents race condition)
      const { data: updated, error: updateError } = await adminClient
        .from('team_members')
        .update({
          leave_balance: membership.annual_leave_days,
          leave_balance_year: currentYear,
        })
        .eq('user_id', user.id)
        .lt('leave_balance_year', currentYear) // Only update if year is still old
        .select('leave_balance, leave_balance_year')
        .single();

      if (!updateError && updated) {
        // Update was successful (we were first)
        leaveBalance = updated.leave_balance;
        needsReset = true;
      } else {
        // Another request already updated, fetch fresh data
        const { data: freshData } = await adminClient
          .from('team_members')
          .select('leave_balance, leave_balance_year')
          .eq('user_id', user.id)
          .single();

        if (freshData) {
          leaveBalance = freshData.leave_balance;
          needsReset = freshData.leave_balance_year === currentYear &&
                       membership.leave_balance_year < currentYear;
        }
      }
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
