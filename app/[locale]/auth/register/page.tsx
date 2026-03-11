'use client';

// Page d'inscription simplifiée.
// Le type de contrat et le secteur sont définis par le chef d'équipe, pas ici.

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { Mail, Lock, User, UserPlus, AlertCircle, Loader2, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { UserProfile } from '@/types/firestore';

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Pre-fill from invite link query params
    useEffect(() => {
        const prefillEmail = searchParams.get('email');
        const prefillFirst = searchParams.get('firstName');
        const prefillLast = searchParams.get('lastName');
        if (prefillEmail) setEmail(prefillEmail);
        if (prefillFirst) setFirstName(prefillFirst);
        if (prefillLast) setLastName(prefillLast);
    }, [searchParams]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !firstName || !lastName || !birthDate) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        const displayName = `${firstName} ${lastName}`.trim();

        setLoading(true);
        setError(null);

        try {
            if (!auth || !db) {
                throw new Error("L'application Firebase n'est pas correctement initialisée. Vérifiez vos variables d'environnement.");
            }

            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Setup profile and display name via Server API (much faster)
            // We pass the token to identify the user if needed, but here UID is enough since we just created it.
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email,
                    firstName,
                    lastName,
                    birthDate
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erreur lors de la configuration du profil");
            }

            toast.success('Compte créé avec succès !');
            const redirect = searchParams.get('redirect');
            router.push(redirect || '/');
        } catch (err: unknown) {
            const firebaseErr = err as { code?: string; message?: string };
            console.error('Registration error detailed:', err);

            let message = "Erreur lors de l'inscription";

            if (firebaseErr.code === 'auth/email-already-in-use') {
                message = "Cet email est déjà utilisé";
            } else if (firebaseErr.code === 'auth/weak-password') {
                message = "Le mot de passe est trop faible (6 caractères min.)";
            } else if (firebaseErr.code === 'auth/configuration-not-found') {
                message = "L'authentification n'est pas configurée. Contactez l'administrateur.";
            } else if (firebaseErr.code === 'auth/operation-not-allowed') {
                message = "L'inscription par email n'est pas activée dans la console Firebase.";
            } else if (firebaseErr.message) {
                // Show the specific error message to help debug
                message = `Erreur : ${firebaseErr.message}`;
            }

            setError(message);
            toast.error(message);
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
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blueprint-500)] to-[var(--cyan-500)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight gradient-text-amber mb-2">Créer un profil</h1>
                        <p className="text-[var(--text-tertiary)] text-center text-sm">
                            Rejoignez Absencia. Votre chef d&apos;équipe configurera votre contrat.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Prénom */}
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-[var(--text-secondary)]">Prénom</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Jean"
                                        className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nom */}
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-[var(--text-secondary)]">Nom</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Dupont"
                                        className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date de naissance */}
                        <div className="space-y-2">
                            <Label htmlFor="birthDate" className="text-sm font-medium text-[var(--text-secondary)]">Date de naissance</Label>
                            <div className="relative group">
                                <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">Email professionnel</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jean@entreprise.com"
                                    autoComplete="email"
                                    spellCheck={false}
                                    className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">Mot de passe</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">Minimum 6 caractères</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-base font-semibold"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Créer mon compte'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-[var(--text-tertiary)]">
                        Vous avez déjà un compte ?{' '}
                        <Link href="/login" className="text-[var(--blueprint-500)] hover:text-[var(--cyan-400)] font-bold hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
