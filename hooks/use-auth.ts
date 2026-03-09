/**
 * Hook d'authentification Firebase
 * 
 * Consomme l'AuthContext pour fournir l'utilisateur et son profil.
 */

'use client';

import { User } from 'firebase/auth';
import { useAuthContext } from '@/contexts/auth-context';
import { UserProfile } from '@/types/firestore';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const { user, profile, loading, error } = useAuthContext();

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    error,
  };
}
