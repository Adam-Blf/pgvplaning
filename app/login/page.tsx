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
  Cake,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

// Composant bonhomme animé (style Ralph Loop)
const PeekingPerson = ({ isLooking, delay = 0 }: { isLooking: boolean; delay?: number }) => (
  <motion.div
    className="relative w-8 h-10"
    initial={false}
    animate={{
      rotateY: isLooking ? 0 : 180,
    }}
    transition={{
      duration: 0.4,
      delay,
      type: "spring",
      stiffness: 200,
      damping: 20
    }}
    style={{ transformStyle: 'preserve-3d' }}
  >
    {/* Face avant (regarde) */}
    <motion.svg
      viewBox="0 0 40 50"
      className="absolute inset-0 w-full h-full"
      style={{ backfaceVisibility: 'hidden' }}
    >
      {/* Corps */}
      <ellipse cx="20" cy="38" rx="12" ry="10" fill="#FCD34D" />
      {/* Tête */}
      <circle cx="20" cy="18" r="14" fill="#FCD34D" />
      {/* Yeux */}
      <motion.g
        animate={{
          y: isLooking ? [0, -1, 0] : 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <circle cx="14" cy="16" r="3.5" fill="white" />
        <circle cx="26" cy="16" r="3.5" fill="white" />
        <motion.circle
          cx="14" cy="16" r="2" fill="#1F2937"
          animate={{
            x: isLooking ? [0, 1, 0] : 0,
            y: isLooking ? [0, 1, 0] : 0,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.circle
          cx="26" cy="16" r="2" fill="#1F2937"
          animate={{
            x: isLooking ? [0, 1, 0] : 0,
            y: isLooking ? [0, 1, 0] : 0,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.g>
      {/* Sourcils */}
      <motion.g
        animate={{ y: isLooking ? 0 : -2 }}
      >
        <line x1="10" y1="10" x2="17" y2="11" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="11" x2="30" y2="10" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
      {/* Bouche */}
      <motion.path
        d="M 15 24 Q 20 28, 25 24"
        stroke="#92400E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: isLooking
            ? "M 15 24 Q 20 28, 25 24"
            : "M 16 25 Q 20 24, 24 25"
        }}
      />
    </motion.svg>

    {/* Face arrière (dos tourné) */}
    <motion.svg
      viewBox="0 0 40 50"
      className="absolute inset-0 w-full h-full"
      style={{
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)'
      }}
    >
      {/* Corps de dos */}
      <ellipse cx="20" cy="38" rx="12" ry="10" fill="#F59E0B" />
      {/* Tête de dos */}
      <circle cx="20" cy="18" r="14" fill="#F59E0B" />
      {/* Cheveux/motif de dos */}
      <path
        d="M 10 12 Q 15 6, 20 8 Q 25 6, 30 12"
        stroke="#D97706"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Petites mains qui se couvrent les yeux (visibles de dos) */}
      <ellipse cx="12" cy="14" rx="4" ry="3" fill="#FBBF24" />
      <ellipse cx="28" cy="14" rx="4" ry="3" fill="#FBBF24" />
    </motion.svg>
  </motion.div>
);
import { auth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Link from 'next/link';

// Mapping des erreurs Firebase vers des messages en français
function getAuthErrorMessage(error: unknown): string {
  const err = error as { message?: string; code?: string };
  const message = err?.message?.toLowerCase() || '';

  if (message.includes('auth/email-already-in-use') ||
    message.includes('email already in use')) {
    return 'Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.';
  }

  if (message.includes('auth/invalid-credential') || message.includes('auth/user-not-found') || message.includes('auth/wrong-password')) {
    return 'Email ou mot de passe incorrect.';
  }

  if (message.includes('auth/weak-password')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  if (message.includes('auth/invalid-email') || message.includes('email not valid')) {
    return 'Adresse email invalide.';
  }

  if (message.includes('auth/too-many-requests') || message.includes('too many requests')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes.';
  }

  if (message.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter.';
  }

  if (message.includes('network-request-failed') || message.includes('network') || message.includes('fetch')) {
    return `Erreur de connexion. Vérifiez que l'API Key est valide pour ce domaine. (${err?.code || 'Erreur réseau'})`;
  }

  if (message.includes('invalid-api-key') || message.includes('api key not valid')) {
    return "La clé API Firebase est invalide ou non reconnue.";
  }

  return err.message || 'Une erreur est survenue. Veuillez réessayer.';
}

const features = [
  { icon: Shield, text: 'Données sécurisées' },
  { icon: Zap, text: 'Sync instantanée' },
  { icon: Sparkles, text: 'Export ICS' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const isConfigured = useMemo(() => !!auth, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase non configuré. Contactez l\'administrateur.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
        router.refresh();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`.trim()
        });

        // Optionnel: On pourrait enregistrer des champs supplémentaires dans Firestore ici
        // comme le `phone` et `birthDate` si besoin.

        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error("[AUTH ERROR OVERVIEW]", err);
      const errorObj = err instanceof Error ? err : { message: String(err) };
      console.error("[AUTH ERROR DETAILS]", errorObj.message);
      setError(getAuthErrorMessage(errorObj));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-11 pr-4 py-3.5 bg-[var(--bg-overlay)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";
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
                <span className="font-bold text-[var(--text-primary)] text-2xl tracking-tight">Absencia</span>
                <span className="text-[var(--text-muted)] text-sm block">Gestion des Absences</span>
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
              <span className="font-bold text-[var(--text-primary)] text-xl">Absencia</span>
              <span className="text-[var(--text-muted)] text-xs block">Gestion des Absences</span>
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
                  Supabase (ou Firebase) n&apos;est pas configuré. Ajoutez les variables d&apos;environnement:
                </p>
                <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-left border border-[var(--border-subtle)]">
                  <code className="text-xs text-amber-400 font-mono">
                    NEXT_PUBLIC_FIREBASE_API_KEY<br />
                    NEXT_PUBLIC_FIREBASE_PROJECT_ID
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
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m
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
                    {/* Bonhommes animés au-dessus du champ */}
                    <div className="flex justify-center gap-2 mb-2">
                      <PeekingPerson isLooking={!showPassword} delay={0} />
                      <PeekingPerson isLooking={!showPassword} delay={0.05} />
                      <PeekingPerson isLooking={!showPassword} delay={0.1} />
                    </div>
                    <div className="relative">
                      <Lock className={iconClasses} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClasses} pr-12`}
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-amber-500 transition-all duration-200"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={showPassword ? 'visible' : 'hidden'}
                            initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                            transition={{ duration: 0.15 }}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 text-center">
                      {showPassword ? '🙈 Les gardiens se sont retournés !' : '👀 Les gardiens surveillent...'}
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl text-sm ${error.includes('Vérifiez')
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
