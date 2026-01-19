'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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
    const supabase = createClient();

    // If Supabase is not configured, just mark as not authenticated
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial user with error handling
    const initializeAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Auth initialization error:', authError);
          if (mounted.current) {
            setError('Erreur de connexion');
          }
        }
        if (mounted.current) {
          setUser(user);
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        if (mounted.current) {
          setError('Erreur inattendue');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted.current) {
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      mounted.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    error,
  };
}
