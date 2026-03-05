/**
 * Hook d'authentification Firebase
 * 
 * Gère l'état d'authentification de l'utilisateur :
 * - Écoute les changements d'état Firebase Auth
 * - Stocke/supprime le token JWT dans un cookie sécurisé
 * - Rafraîchit automatiquement le token toutes les 10 minutes
 * - Gère les erreurs d'authentification
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Cookies from 'js-cookie';

/** État retourné par le hook useAuth */
interface AuthState {
  user: User | null;          // Utilisateur Firebase (null si déconnecté)
  loading: boolean;           // true pendant le chargement initial
  isAuthenticated: boolean;   // true si l'utilisateur est connecté
  error: string | null;       // Message d'erreur éventuel
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true); // Référence pour éviter les mises à jour après démontage

  useEffect(() => {
    mounted.current = true;

    // Si Firebase n'est pas configuré, arrêter le chargement
    if (!auth) {
      setLoading(false);
      return;
    }

    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Récupérer et stocker le token JWT dans un cookie sécurisé
            const token = await firebaseUser.getIdToken();
            Cookies.set('firebase-token', token, { expires: 7, secure: true, sameSite: 'strict' });
          } catch (e) {
            console.error('Erreur lors de la récupération du token :', e);
          }
        } else {
          // Supprimer le cookie si l'utilisateur est déconnecté
          Cookies.remove('firebase-token');
        }

        // Mettre à jour l'état seulement si le composant est monté
        if (mounted.current) {
          setUser(firebaseUser);
          setLoading(false);
          setError(null);
        }
      },
      (authError) => {
        console.error('Erreur de changement d\'état auth :', authError);
        if (mounted.current) {
          setError('Erreur de connexion');
          setLoading(false);
          Cookies.remove('firebase-token');
        }
      }
    );

    // Rafraîchir le token périodiquement (toutes les 10 minutes)
    // Évite l'expiration du token pendant une session longue
    const tokenRefreshInterval = setInterval(async () => {
      const currentUser = auth?.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true); // true = forcer le rafraîchissement
          Cookies.set('firebase-token', token, { expires: 7, secure: true, sameSite: 'strict' });
        } catch (e) {
          console.error('Erreur de rafraîchissement du token :', e);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Nettoyage : désabonner l'écouteur et arrêter le rafraîchissement
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
