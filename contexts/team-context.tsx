/**
 * Contexte d'équipe (Team Context)
 * 
 * Fournit les données de l'équipe à tous les composants enfants :
 * - Informations de l'équipe (nom, code, description)
 * - Membres de l'équipe avec leurs profils
 * - Rôle de l'utilisateur actuel (leader/membre)
 * - Actions : rafraîchir les données, quitter l'équipe
 * 
 * S'écoute sur les changements d'authentification Firebase
 * et charge automatiquement les données d'équipe depuis Firestore.
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

// ============================================================
// Types
// ============================================================

/** Représentation d'une équipe */
export interface Team {
  id: string;
  name: string;         // Nom de l'équipe
  code: string;         // Code d'accès unique (8 caractères)
  description?: string; // Description optionnelle
  created_by: string;   // UID du créateur
  created_at: string;   // Date de création ISO
  teamIcalToken?: string; // Token pour le flux iCal d'équipe
  settings?: {
    minPresenceRequired?: number;
    allowMemberInvite?: boolean;
    autoApproveAbsences?: boolean;
  };
}

/** Membre d'une équipe avec son profil */
export interface TeamMember {
  id: string;
  user_id: string;  // UID Firebase de l'utilisateur
  team_id: string;  // ID de l'équipe
  role: 'leader' | 'moderator' | 'member'; // Rôle dans l'équipe
  status: 'pending' | 'approved'; // Statut SaaS d'adhésion
  joined_at: string;          // Date d'arrivée
  weeklyHours?: number;       // Heures/semaine définies par le leader
  bonusDays?: number;         // Jours bonus (0-3)
  recoveryHours?: number;     // Heures récup (heures sup)
  employee_type?: string;
  work_time_category?: string;
  annual_leave_days?: number;
  leave_balance?: number;
  profile?: {                 // Profil utilisateur joint
    id: string;
    email: string;
    displayName?: string;
    color?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
}

/** Valeur exposée par le contexte d'équipe */
export interface TeamContextValue {
  team: Team | null;
  membership: TeamMember | null;
  members: TeamMember[];
  isLeader: boolean;
  isModerator: boolean;
  isLeaderOrMod: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  error: string | null;
  refreshTeam: () => Promise<void>;
  leaveTeam: () => Promise<void>;
  approveMember: (memberId: string) => Promise<void>;
  updateMemberSettings: (memberId: string, data: Partial<TeamMember>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  deleteTeam: () => Promise<void>;
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
          const mData = mDoc.data();

          // Vérifier si le membre est approuvé (le leader est toujours approuvé)
          const status = mData.status || (mData.role === 'leader' ? 'approved' : 'pending');

          // Fetch profile for each member
          let profile = undefined;
          const profileRef = doc(db, 'profiles', mData.user_id);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            profile = { id: profileSnap.id, ...profileSnap.data() } as TeamMember['profile'];
          }

          membersList.push({
            id: mDoc.id,
            user_id: mData.user_id,
            team_id: mData.team_id,
            role: mData.role,
            status: status as 'pending' | 'approved',
            joined_at: mData.joined_at,
            weeklyHours: mData.weeklyHours,
            bonusDays: mData.bonusDays,
            recoveryHours: mData.recoveryHours,
            employee_type: mData.employee_type,
            work_time_category: mData.work_time_category,
            annual_leave_days: mData.annual_leave_days,
            leave_balance: mData.leave_balance,
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

  const approveMember = useCallback(async (memberId: string) => {
    if (!db || !membership || !['leader', 'moderator'].includes(membership.role)) return;

    try {
      const memberRef = doc(db, 'team_members', memberId);
      await updateDoc(memberRef, {
        status: 'approved',
        updated_at: new Date().toISOString()
      });
      await fetchTeamData();
    } catch (err) {
      console.error('Error approving member:', err);
      throw err;
    }
  }, [membership, fetchTeamData]);

  const updateMemberSettings = useCallback(async (memberId: string, data: Partial<TeamMember>) => {
    if (!db || !membership || !['leader', 'moderator'].includes(membership.role)) return;

    try {
      const memberRef = doc(db, 'team_members', memberId);
      await updateDoc(memberRef, {
        ...data,
        updated_at: new Date().toISOString()
      });
      await fetchTeamData();
    } catch (err) {
      console.error('Error updating member settings:', err);
      throw err;
    }
  }, [membership, fetchTeamData]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!db || !membership || membership.role !== 'leader') return;

    try {
      await deleteDoc(doc(db, 'team_members', memberId));
      await fetchTeamData();
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  }, [membership, fetchTeamData]);

  const deleteTeam = useCallback(async () => {
    if (!db || !membership || membership.role !== 'leader' || !team) return;

    try {
      // Delete all members
      for (const m of members) {
        await deleteDoc(doc(db, 'team_members', m.id));
      }
      // Delete team
      await deleteDoc(doc(db, 'teams', team.id));
      setTeam(null);
      setMembership(null);
      setMembers([]);
    } catch (err) {
      console.error('Error deleting team:', err);
      throw err;
    }
  }, [membership, team, members]);

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

  // Check super_admin status
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    if (!auth || !db) return;
    const firestore = db;
    const firebaseAuth = auth;
    const checkSuperAdmin = async () => {
      const user = firebaseAuth.currentUser;
      if (!user) { setIsSuperAdmin(false); return; }
      try {
        const saDoc = await getDoc(doc(firestore, 'super_admins', user.uid));
        setIsSuperAdmin(saDoc.exists());
      } catch { setIsSuperAdmin(false); }
    };
    const unsub = onAuthStateChanged(firebaseAuth, (u) => { if (u) checkSuperAdmin(); else setIsSuperAdmin(false); });
    return () => unsub();
  }, []);

  const isLeader = membership?.role === 'leader';
  const isModerator = membership?.role === 'moderator';
  const isLeaderOrMod = isLeader || isModerator;

  const value: TeamContextValue = {
    team,
    membership,
    members,
    isLeader,
    isModerator,
    isLeaderOrMod,
    isSuperAdmin,
    loading,
    error,
    refreshTeam: fetchTeamData,
    leaveTeam,
    approveMember,
    updateMemberSettings,
    removeMember,
    deleteTeam,
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
