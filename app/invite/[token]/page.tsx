'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  LogIn,
  UserPlus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

type InviteState = 'loading' | 'valid' | 'invalid' | 'joining' | 'success' | 'error' | 'need_auth';

interface TeamInfo {
  id: string;
  name: string;
  code: string;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [state, setState] = useState<InviteState>('loading');
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const supabase = createClient();

  // Vérifier l'authentification
  useEffect(() => {
    if (!supabase) return;

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      // Re-valider l'invitation si l'utilisateur vient de se connecter
      if (event === 'SIGNED_IN') {
        validateInvitation();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Valider l'invitation
  const validateInvitation = async () => {
    setState('loading');
    try {
      const response = await fetch(`/api/teams/invitations/${token}`);
      const data = await response.json();

      if (!response.ok || !data.valid) {
        setState('invalid');
        setError(data.error || 'Invitation invalide');
        return;
      }

      setTeam(data.team);
      setState(isAuthenticated ? 'valid' : 'need_auth');
    } catch (err) {
      console.error('Error validating invitation:', err);
      setState('invalid');
      setError('Erreur lors de la validation');
    }
  };

  useEffect(() => {
    if (isAuthenticated !== null) {
      validateInvitation();
    }
  }, [token, isAuthenticated]);

  // Accepter l'invitation
  const acceptInvitation = async () => {
    setState('joining');
    try {
      const response = await fetch(`/api/teams/invitations/${token}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setError(data.error || 'Erreur lors de l\'adhésion');
        return;
      }

      setState('success');

      // Confetti !
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      });

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);

    } catch (err) {
      console.error('Error accepting invitation:', err);
      setState('error');
      setError('Erreur lors de l\'adhésion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {state === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">Vérification de l&apos;invitation...</p>
              </motion.div>
            )}

            {/* Invalid invitation */}
            {state === 'invalid' && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Invitation invalide
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  {error || 'Ce lien d\'invitation n\'est plus valide.'}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] rounded-xl text-sm font-medium transition-colors"
                >
                  Retour à l&apos;accueil
                </Link>
              </motion.div>
            )}

            {/* Need authentication */}
            {state === 'need_auth' && team && (
              <motion.div
                key="need_auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Rejoindre {team.name}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Connectez-vous ou créez un compte pour rejoindre cette équipe.
                </p>

                <div className="space-y-3">
                  <Link
                    href={`/login?redirect=/invite/${token}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </Link>
                  <Link
                    href={`/login?redirect=/invite/${token}&mode=signup`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl font-medium transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Valid - Ready to join */}
            {state === 'valid' && team && (
              <motion.div
                key="valid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Invitation à rejoindre
                </h1>
                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 mb-6 border border-[var(--border-subtle)]">
                  <p className="text-2xl font-bold text-gradient">{team.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Code: {team.code}</p>
                </div>

                <motion.button
                  onClick={acceptInvitation}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Users className="w-5 h-5" />
                  Rejoindre l&apos;équipe
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Joining */}
            {state === 'joining' && (
              <motion.div
                key="joining"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">Vous rejoignez l&apos;équipe...</p>
              </motion.div>
            )}

            {/* Success */}
            {state === 'success' && team && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Bienvenue dans l&apos;équipe !
                </h1>
                <p className="text-[var(--text-secondary)] text-sm">
                  Vous êtes maintenant membre de <span className="font-semibold text-amber-500">{team.name}</span>
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-4">
                  Redirection en cours...
                </p>
              </motion.div>
            )}

            {/* Error */}
            {state === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Erreur
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  {error || 'Une erreur est survenue.'}
                </p>
                <button
                  onClick={() => validateInvitation()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl transition-colors"
                >
                  Réessayer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="text-sm text-[var(--text-muted)] hover:text-amber-500 transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
