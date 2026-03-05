'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            Cookies.set('firebase-token', token, { expires: 7, secure: true, sameSite: 'strict' });
          } catch (e) {
            console.error('Error getting ID token', e);
          }
        } else {
          Cookies.remove('firebase-token');
        }

        if (mounted.current) {
          setUser(firebaseUser);
          setLoading(false);
          setError(null);
        }
      },
      (authError) => {
        console.error('Auth state change error:', authError);
        if (mounted.current) {
          setError('Erreur de connexion');
          setLoading(false);
          Cookies.remove('firebase-token');
        }
      }
    );

    // Refresh token periodically (every 10 minutes)
    const tokenRefreshInterval = setInterval(async () => {
      const currentUser = auth?.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true);
          Cookies.set('firebase-token', token, { expires: 7, secure: true, sameSite: 'strict' });
        } catch (e) {
          console.error('Error refreshing ID token', e);
        }
      }
    }, 10 * 60 * 1000);

    return () => {
      mounted.current = false;
      unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    error,
  };
}
