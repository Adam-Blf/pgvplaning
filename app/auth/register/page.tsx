'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, UserPlus, AlertCircle, Loader2, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';
import { calculateInitialLeaveBalance } from '@/lib/firebase/balances';
import { EmployeeType, SectorType, UserProfile } from '@/types/firestore';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [employeeType, setEmployeeType] = useState<EmployeeType>('non-cadre');
    const [sector, setSector] = useState<SectorType>('prive');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !displayName) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
            const user = userCredential.user;

            // 2. Update profile name
            await updateProfile(user, { displayName });

            // 3. Create profile in Firestore
            const initialBalance = calculateInitialLeaveBalance(employeeType, sector);

            const profileData: UserProfile = {
                id: user.uid,
                email: user.email!,
                displayName,
                role: 'member',
                employeeType,
                sector,
                leaveBalance: {
                    total: initialBalance,
                    used: 0,
                    remaining: initialBalance,
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            await setDoc(doc(db!, 'profiles', user.uid), profileData);

            toast.success('Compte créé avec succès !');
            router.push('/team/onboarding'); // Redirect to onboarding
        } catch (err: any) {
            console.error(err);
            let message = "Erreur lors de l'inscription";
            if (err.code === 'auth/email-already-in-use') {
                message = "Cet email est déjà utilisé";
            } else if (err.code === 'auth/weak-password') {
                message = "Le mot de passe est trop faible (6 caractères min.)";
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
                className="w-full max-w-lg z-10"
            >
                <div className="glass-elevated p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blueprint-500)] to-[var(--cyan-500)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Créer un profil</h1>
                        <p className="text-[var(--text-tertiary)] text-center">
                            Rejoignez Absencia pour gérer vos absences simplement
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Nom complet</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                                    <Input
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Jean Dupont"
                                        className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50"
                                        required
                                    />
                                </div>
                            </div>

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
                                        className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

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
                                    className="pl-10 h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl focus:ring-[var(--blueprint-500)]/20 focus:border-[var(--blueprint-500)]/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type d'employé</Label>
                                <Select value={employeeType} onValueChange={(v) => setEmployeeType(v as EmployeeType)}>
                                    <SelectTrigger className="h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl">
                                        <Briefcase className="w-4 h-4 mr-2 text-[var(--text-muted)]" />
                                        <SelectValue placeholder="Choisir un type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[var(--bg-surface)] border-white/10">
                                        <SelectItem value="cadre">Cadre</SelectItem>
                                        <SelectItem value="non-cadre">Non-cadre (CDI)</SelectItem>
                                        <SelectItem value="cdd">CDD</SelectItem>
                                        <SelectItem value="alternant">Alternant / Apprenti</SelectItem>
                                        <SelectItem value="stagiaire">Stagiaire</SelectItem>
                                        <SelectItem value="interim">Intérimaire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Secteur</Label>
                                <Select value={sector} onValueChange={(v) => setSector(v as SectorType)}>
                                    <SelectTrigger className="h-11 bg-[var(--bg-overlay)] border-white/5 rounded-xl">
                                        <Building2 className="w-4 h-4 mr-2 text-[var(--text-muted)]" />
                                        <SelectValue placeholder="Choisir un secteur" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[var(--bg-surface)] border-white/10">
                                        <SelectItem value="prive">Privé</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
