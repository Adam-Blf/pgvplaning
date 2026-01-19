'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Mail, Lock, Loader2, AlertTriangle, UserIcon, Phone } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Mapping des erreurs Supabase vers des messages en français
function getAuthErrorMessage(error: Error | { message: string; code?: string }): string {
  const message = error.message.toLowerCase();

  // Erreurs d'inscription - email déjà utilisé
  if (message.includes('user already registered') ||
      message.includes('already been registered') ||
      message.includes('email already in use') ||
      message.includes('duplicate key') && message.includes('email')) {
    return 'Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.';
  }

  // Erreurs d'inscription - téléphone déjà utilisé
  if (message.includes('phone') && (message.includes('already') || message.includes('duplicate'))) {
    return 'Ce numéro de téléphone est déjà associé à un compte.';
  }

  // Erreurs de connexion
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect.';
  }

  // Mot de passe trop court
  if (message.includes('password') && message.includes('at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  // Email invalide
  if (message.includes('invalid email') || message.includes('email not valid')) {
    return 'Adresse email invalide.';
  }

  // Trop de tentatives
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes.';
  }

  // Email non confirmé
  if (message.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter.';
  }

  // Erreur réseau
  if (message.includes('network') || message.includes('fetch')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.';
  }

  // Message par défaut
  return error.message || 'Une erreur est survenue. Veuillez réessayer.';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const isConfigured = useMemo(() => isSupabaseConfigured(), []);
  const supabase = useMemo(() => createClient(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase non configuré. Contactez l\'administrateur.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              phone: phone,
            },
          },
        });
        if (error) throw error;
        setError('Vérifiez votre email pour confirmer votre inscription.');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : { message: String(err) };
      setError(getAuthErrorMessage(errorObj));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-2xl">PGV</span>
            <span className="text-slate-400 text-sm block -mt-1">Planning</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-8 backdrop-blur-sm">
          {!isConfigured ? (
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-white mb-2">Configuration requise</h1>
              <p className="text-slate-400 text-sm mb-4">
                Supabase n&apos;est pas configuré. Ajoutez les variables d&apos;environnement:
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 text-left">
                <code className="text-xs text-emerald-400">
                  NEXT_PUBLIC_SUPABASE_URL<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white text-center mb-6">
                {mode === 'login' ? 'Connexion' : 'Inscription'}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-400 mb-2">
                        Prénom
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Jean"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-400 mb-2">
                        Nom
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Dupont"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-400 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="vous@exemple.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className={`p-3 rounded-lg text-sm ${
                    error.includes('Vérifiez')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {mode === 'login'
                    ? "Pas encore de compte ? S'inscrire"
                    : 'Déjà un compte ? Se connecter'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
