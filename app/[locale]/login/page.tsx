'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Activity, Mail, Lock, LogIn, Chrome, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailLogin= async (e: React.FormEvent) => {
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

      <div
        className="w-full max-w-md z-10 animate-fade-up opacity-0"
      >
        <div className="glass-elevated p-8 rounded-2xl border border-white/10 border-t-2 border-t-[var(--blueprint-500)]/50 shadow-xl shadow-sky-500/5 relative">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--blueprint-500)]/5 via-transparent to-transparent rounded-2xl" />
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blueprint-500)] to-[var(--cyan-500)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 hover:rotate-12 transition-transform duration-200"
            >
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text-amber mb-2">Bienvenue</h1>
            <p className="text-[var(--text-tertiary)] text-center">
              Connectez-vous pour accéder à votre espace Absencia
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  autoComplete="email"
                  spellCheck={false}
                  className="w-full bg-[var(--bg-overlay)] border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50 transition-[border-color,box-shadow] outline-none text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-up opacity-0" style={{ animationDelay: '80ms' }}>
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[var(--bg-overlay)] border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50 transition-[border-color,box-shadow] outline-none text-white"
                  required
                />
              </div>
            </div>

            <div className="pt-2 animate-fade-up opacity-0" style={{ animationDelay: '160ms' }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-semibold"
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
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#040e24] px-4 text-[var(--text-muted)] font-medium tracking-widest leading-none py-1 rounded-full border border-white/5">Ou continuer avec</span>
            </div>
          </div>

          <div className="animate-fade-up opacity-0" style={{ animationDelay: '240ms' }}>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium transition-[transform,color,background-color,border-color,box-shadow]"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Google
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-[var(--text-tertiary)]">
            Vous n'avez pas de compte ?{' '}
            <Link href="/auth/register" className="text-[var(--blueprint-500)] hover:text-[var(--cyan-400)] font-bold hover:underline">
              Créer un profil
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p
          className="mt-8 text-center text-xs text-[var(--text-muted)] tracking-wider uppercase font-medium animate-fade-in opacity-0"
          style={{ animationDelay: '800ms' }}
        >
          Absencia par Blackout Prod &copy; 2026
        </p>
      </div>
    </div>
  );
}
