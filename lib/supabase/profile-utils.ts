import { SupabaseClient, User } from '@supabase/supabase-js';

interface ProfileResult {
  success: boolean;
  error?: unknown;
  isNew?: boolean;
}

/**
 * Ensure user profile exists in the database
 * Creates the profile if it doesn't exist (for users created before migration)
 */
export async function ensureUserProfile(
  adminClient: SupabaseClient,
  user: User
): Promise<ProfileResult> {
  try {
    // Check if profile exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return { success: true, isNew: false };
    }

    // Create profile if it doesn't exist
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
      return { success: false, error: profileError };
    }

    return { success: true, isNew: true };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Update user's current team in profile
 */
export async function updateUserCurrentTeam(
  adminClient: SupabaseClient,
  userId: string,
  teamId: string | null
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const { error } = await adminClient
      .from('profiles')
      .update({ current_team_id: teamId })
      .eq('id', userId);

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
