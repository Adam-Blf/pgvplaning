'use client';

// Page d'inscription simplifiée.
// Le type de contrat et le secteur sont définis par le chef d'équipe, pas ici.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle, Loader2, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserProfile } from '@/types/firestore';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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

            // 2. Prepare profile data
            const profileData: UserProfile = {
                id: user.uid,
                email: user.email!,
                displayName,
                first_name: firstName,
                last_name: lastName,
                birth_date: birthDate,
                role: 'member',
                employeeType: 'cdi',
                workTimeCategory: 'temps-plein',
                workTimePercentage: 100,
                sector: 'prive',
                leaveBalance: {
                    total: 25,
                    used: 0,
                    remaining: 25,
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            // 3. Update Firebase Profile and Firestore Profile in parallel
            // We keep these two in parallel for speed
            await Promise.all([
                updateProfile(user, { displayName }),
                setDoc(doc(db!, 'profiles', user.uid), profileData),
            ]);

            // 4. Send verification email separately after profile is ready
            // Doing this sequentially avoids some "Internal Error -26" caused by concurrent Auth state updates
            await sendEmailVerification(user, {
                url: `${window.location.origin}/fr/auth/login?verified=1`,
                handleCodeInApp: false,
            });

            toast.success('Compte créé ! Vérifiez votre boîte mail pour activer votre compte.');
            router.push('/auth/verify-email');
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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-elevated p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blueprint-500)] to-[var(--cyan-500)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Créer un profil</h1>
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
                                <Label htmlFor="firstName">Prénom</Label>
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
                                <Label htmlFor="lastName">Nom</Label>
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
                            <Label htmlFor="birthDate">Date de naissance</Label>
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
                            <Label htmlFor="email">Email professionnel</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jean@entreprise.com"
                                    className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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
                            className="w-full h-12 rounded-xl bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-bold shadow-lg shadow-blue-500/20"
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
                        <Link href="/login" className="text-[var(--blueprint-500)] font-bold hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
