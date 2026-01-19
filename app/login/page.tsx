'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Mail,
  Lock,
  Loader2,
  AlertTriangle,
  UserIcon,
  Phone,
  Cake,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Link from 'next/link';

// Mapping des erreurs Supabase vers des messages en français
function getAuthErrorMessage(error: Error | { message: string; code?: string }): string {
  const message = error.message.toLowerCase();

  if (message.includes('user already registered') ||
      message.includes('already been registered') ||
      message.includes('email already in use') ||
      message.includes('duplicate key') && message.includes('email')) {
    return 'Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.';
  }

  if (message.includes('phone') && (message.includes('already') || message.includes('duplicate'))) {
    return 'Ce numéro de téléphone est déjà associé à un compte.';
  }

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect.';
  }

  if (message.includes('password') && message.includes('at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  if (message.includes('invalid email') || message.includes('email not valid')) {
    return 'Adresse email invalide.';
  }

  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes.';
  }

  if (message.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.';
  }

  return error.message || 'Une erreur est survenue. Veuillez réessayer.';
}

const features = [
  { icon: Shield, text: 'Données sécurisées' },
  { icon: Zap, text: 'Sync instantanée' },
  { icon: Sparkles, text: 'Export ICS' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
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
              birth_date: birthDate || null,
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

  const inputClasses = "w-full pl-11 pr-4 py-3.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-2";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]";

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-amber-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-amber-500/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-transform group-hover:scale-105">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-amber-500/20 rounded-2xl blur-sm group-hover:bg-amber-500/30 transition-colors" />
              </div>
              <div>
                <span className="font-bold text-[var(--text-primary)] text-2xl tracking-tight">PGV Planning</span>
                <span className="text-[var(--text-muted)] text-sm block">Gestion d&apos;Équipe</span>
              </div>
            </Link>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-6">
              <span className="text-[var(--text-primary)]">Organisez votre</span>
              <br />
              <span className="text-gradient">équipe simplement</span>
            </h1>

            <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-md leading-relaxed">
              Planifiez les présences, congés et télétravail de votre équipe.
              Exportez vers tous vos calendriers.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                >
                  <feature.icon className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-[var(--text-primary)] text-xl">PGV Planning</span>
              <span className="text-[var(--text-muted)] text-xs block">Gestion d&apos;Équipe</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-8 shadow-xl shadow-black/20">
            {!isConfigured ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Configuration requise</h1>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Supabase n&apos;est pas configuré. Ajoutez les variables d&apos;environnement:
                </p>
                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-left border border-[var(--border-subtle)]">
                  <code className="text-xs text-amber-400 font-mono">
                    NEXT_PUBLIC_SUPABASE_URL<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </code>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm">
                      {mode === 'login'
                        ? 'Connectez-vous pour accéder à votre planning'
                        : 'Rejoignez votre équipe en quelques clics'}
                    </p>
                  </motion.div>
                </div>

                {/* Mode Toggle */}
                <div className="flex p-1 bg-[var(--bg-tertiary)] rounded-xl mb-6">
                  {(['login', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        mode === m
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {m === 'login' ? 'Connexion' : 'Inscription'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="firstName" className={labelClasses}>Prénom</label>
                            <div className="relative">
                              <UserIcon className={iconClasses} />
                              <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClasses}
                                placeholder="Jean"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="lastName" className={labelClasses}>Nom</label>
                            <div className="relative">
                              <UserIcon className={iconClasses} />
                              <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClasses}
                                placeholder="Dupont"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="phone" className={labelClasses}>Téléphone</label>
                            <div className="relative">
                              <Phone className={iconClasses} />
                              <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={inputClasses}
                                placeholder="06 12 34 56 78"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="birthDate" className={labelClasses}>Date de naissance</label>
                            <div className="relative">
                              <Cake className={iconClasses} />
                              <input
                                id="birthDate"
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className={`${inputClasses} [color-scheme:dark]`}
                                max={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label htmlFor="email" className={labelClasses}>Email</label>
                    <div className="relative">
                      <Mail className={iconClasses} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="vous@exemple.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClasses}>Mot de passe</label>
                    <div className="relative">
                      <Lock className={iconClasses} />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClasses}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl text-sm ${
                          error.includes('Vérifiez')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    {mode === 'login' ? (
                      <>Pas encore de compte ?{' '}
                        <button
                          onClick={() => setMode('signup')}
                          className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                        >
                          Créer un compte
                        </button>
                      </>
                    ) : (
                      <>Déjà un compte ?{' '}
                        <button
                          onClick={() => setMode('login')}
                          className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                        >
                          Se connecter
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-amber-500 transition-colors inline-flex items-center gap-1"
            >
              ← Retour à l&apos;accueil
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
