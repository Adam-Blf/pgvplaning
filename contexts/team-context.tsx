'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

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

  const fetchTeamData = useCallback(async () => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's team membership
      const membershipsRef = collection(db, 'team_members');
      const qMembership = query(membershipsRef, where('user_id', '==', user.uid));
      const membershipSnapshot = await getDocs(qMembership);

      if (membershipSnapshot.empty) {
        setTeam(null);
        setMembership(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      const membershipDoc = membershipSnapshot.docs[0];
      const membershipData = membershipDoc.data() as Omit<TeamMember, 'id' | 'profile'>;
      const currentMembership: TeamMember = { id: membershipDoc.id, ...membershipData };

      const teamDocRef = doc(db, 'teams', currentMembership.team_id);
      const teamDocSnap = await getDoc(teamDocRef);

      if (teamDocSnap.exists()) {
        const teamData = { id: teamDocSnap.id, ...teamDocSnap.data() } as Team;
        setTeam(teamData);
        setMembership(currentMembership);

        // Fetch all team members
        const teamMembersQuery = query(membershipsRef, where('team_id', '==', teamData.id));
        const teamMembersSnapshot = await getDocs(teamMembersQuery);

        const membersList: TeamMember[] = [];
        for (const mDoc of teamMembersSnapshot.docs) {
          const mData = mDoc.data() as Omit<TeamMember, 'id' | 'profile'>;

          // Fetch profile for each member
          let profile = undefined;
          const profileRef = doc(db, 'profiles', mData.user_id);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            profile = { id: profileSnap.id, ...profileSnap.data() } as TeamMember['profile'];
          }

          membersList.push({
            id: mDoc.id,
            ...mData,
            profile
          });
        }

        // Sort by joined_at if it exists
        membersList.sort((a, b) => {
          if (!a.joined_at || !b.joined_at) return 0;
          return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
        });

        setMembers(membersList);
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveTeam = useCallback(async () => {
    if (!db || !membership) return;

    try {
      await deleteDoc(doc(db, 'team_members', membership.id));
      setTeam(null);
      setMembership(null);
      setMembers([]);
    } catch (err) {
      console.error('Error leaving team:', err);
      throw err;
    }
  }, [membership]);

  useEffect(() => {
    if (!auth) return;

    // Refresh data when auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        fetchTeamData();
      } else {
        setTeam(null);
        setMembership(null);
        setMembers([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchTeamData]);

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
