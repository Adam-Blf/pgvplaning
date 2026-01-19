'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

// Types
export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  // Joined from profiles
  profile?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
}

export interface TeamContextValue {
  team: Team | null;
  membership: TeamMember | null;
  members: TeamMember[];
  isLeader: boolean;
  loading: boolean;
  error: string | null;
  refreshTeam: () => Promise<void>;
  leaveTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [membership, setMembership] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchTeamData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's team membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        if (membershipError.code === 'PGRST116') {
          // No team found - this is OK, user needs to join/create
          setTeam(null);
          setMembership(null);
          setMembers([]);
        } else {
          throw membershipError;
        }
        setLoading(false);
        return;
      }

      if (membershipData) {
        const teamData = membershipData.team as Team;
        setTeam(teamData);
        setMembership({
          id: membershipData.id,
          user_id: membershipData.user_id,
          team_id: membershipData.team_id,
          role: membershipData.role,
          joined_at: membershipData.joined_at,
        });

        // Fetch all team members with their profiles
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            *,
            profile:profiles(id, email, first_name, last_name, full_name)
          `)
          .eq('team_id', teamData.id)
          .order('joined_at', { ascending: true });

        if (membersError) throw membersError;

        setMembers(membersData?.map(m => ({
          id: m.id,
          user_id: m.user_id,
          team_id: m.team_id,
          role: m.role,
          joined_at: m.joined_at,
          profile: m.profile,
        })) || []);
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const leaveTeam = useCallback(async () => {
    if (!supabase || !membership) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', membership.id);

      if (error) throw error;

      setTeam(null);
      setMembership(null);
      setMembers([]);
    } catch (err) {
      console.error('Error leaving team:', err);
      throw err;
    }
  }, [supabase, membership]);

  useEffect(() => {
    fetchTeamData();

    // Subscribe to auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        fetchTeamData();
      });

      return () => subscription.unsubscribe();
    }
  }, [fetchTeamData, supabase]);

  const value: TeamContextValue = {
    team,
    membership,
    members,
    isLeader: membership?.role === 'leader',
    loading,
    error,
    refreshTeam: fetchTeamData,
    leaveTeam,
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
