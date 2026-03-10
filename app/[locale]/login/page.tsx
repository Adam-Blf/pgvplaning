'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, LogIn, Chrome, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth!, email, password);

      toast.success('Connexion réussie !');
      router.push('/');
    } catch (err: any) {
      console.error(err);
      let message = "Erreur de connexion";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = "Email ou mot de passe incorrect";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Trop de tentatives. Réessayez plus tard.";
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth!, provider);
      toast.success('Connexion Google réussie !');
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Erreur lors de la connexion Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-base)]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--blueprint-500)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--cyan-500)] opacity-10 blur-[120px]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md z-10"
      >
        <div className="glass-elevated p-8 rounded-3xl border border-white/10 shadow-2xl relative">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              whileHover={{ rotate: 12 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blueprint-500)] to-[var(--cyan-500)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
            >
              <Activity className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Bienvenue</h1>
            <p className="text-[var(--text-tertiary)] text-center">
              Connectez-vous pour accéder à votre espace Absencia
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <motion.div custom={0} variants={itemVariants} className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-[var(--bg-overlay)] border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50 transition-all outline-none text-white"
                  required
                />
              </div>
            </motion.div>

            <motion.div custom={1} variants={itemVariants} className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-overlay)] border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50 transition-all outline-none text-white"
                  required
                />
              </div>
            </motion.div>

            <motion.div custom={2} variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all duration-300"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#040e24] px-4 text-[var(--text-muted)] font-medium tracking-widest leading-none py-1 rounded-full border border-white/5">Ou continuer avec</span>
            </div>
          </div>

          <motion.div custom={3} variants={itemVariants}>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium transition-all"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Google
            </Button>
          </motion.div>

          <div className="mt-8 text-center text-sm text-[var(--text-tertiary)]">
            Vous n'avez pas de compte ?{' '}
            <Link href="/auth/register" className="text-[var(--blueprint-500)] font-bold hover:underline">
              Créer un profil
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-xs text-[var(--text-muted)] tracking-wider uppercase font-medium"
        >
          Absencia par Blackout Prod &copy; 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
