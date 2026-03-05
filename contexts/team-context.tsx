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
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
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
}

/** Membre d'une équipe avec son profil */
export interface TeamMember {
  id: string;
  user_id: string;  // UID Firebase de l'utilisateur
  team_id: string;  // ID de l'équipe
  role: 'leader' | 'member'; // Rôle dans l'équipe
  joined_at: string;          // Date d'arrivée
  profile?: {                 // Profil utilisateur joint
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
}

/** Valeur exposée par le contexte d'équipe */
export interface TeamContextValue {
  team: Team | null;              // Équipe actuelle (null si aucune)
  membership: TeamMember | null;  // Adhésion de l'utilisateur
  members: TeamMember[];          // Liste de tous les membres
  isLeader: boolean;              // true si l'utilisateur est leader
  loading: boolean;               // true pendant le chargement
  error: string | null;           // Message d'erreur éventuel
  refreshTeam: () => Promise<void>; // Rafraîchir les données
  leaveTeam: () => Promise<void>;   // Quitter l'équipe
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
