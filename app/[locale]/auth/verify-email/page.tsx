'use client';

// Page affichée après inscription pour indiquer à l'utilisateur de vérifier son email.
// Firebase a envoyé un email de vérification automatiquement.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MailCheck, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client';
import { sendEmailVerification } from 'firebase/auth';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
    const [resending, setResending] = useState(false);
    const [verified, setVerified] = useState(false);

    // Poll every 3s to detect when the email is verified
    // (onAuthStateChanged alone doesn't fire on emailVerified change)
    useEffect(() => {
        if (!auth) return;

        const interval = setInterval(async () => {
            const user = auth?.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    setVerified(true);
                    clearInterval(interval);
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const resendEmail = async () => {
        if (!auth?.currentUser) {
            toast.error('Session expirée. Reconnectez-vous.');
            return;
        }
        setResending(true);
        try {
            await sendEmailVerification(auth.currentUser, {
                url: `${window.location.origin}/fr/auth/login?verified=1`,
            });
            toast.success('Email de vérification renvoyé !');
        } catch {
            toast.error('Erreur lors de l\'envoi. Réessayez dans quelques secondes.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--blueprint-500)] opacity-10 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-elevated p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    {verified ? (
                        // Email verified state
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Email vérifié !</h1>
                            <p className="text-[var(--text-tertiary)] mb-6">
                                Votre compte est activé. Vous pouvez maintenant vous connecter.
                            </p>
                            <Link href="/auth/login">
                                <Button className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                                    Se connecter
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        // Waiting for verification
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-[var(--blueprint-500)]/10 flex items-center justify-center mx-auto mb-6 border border-[var(--blueprint-500)]/20">
                                <MailCheck className="w-8 h-8 text-[var(--blueprint-500)]" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Vérifiez votre email</h1>
                            <p className="text-[var(--text-tertiary)] mb-2">
                                Un email de confirmation vous a été envoyé. Cliquez sur le lien dans l&apos;email pour activer votre compte.
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mb-8">
                                Vérifiez également vos spams si vous ne trouvez pas l&apos;email.
                                <br />
                                Si le lien affiche &quot;déjà utilisé&quot;, pas de panique : votre email est probablement déjà vérifié. Cette page se mettra à jour automatiquement.
                            </p>

                            <div className="space-y-3">
                                <Button
                                    onClick={resendEmail}
                                    disabled={resending}
                                    variant="outline"
                                    className="w-full h-11 rounded-xl border-white/10 text-[var(--text-primary)] hover:bg-white/5"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                                    {resending ? 'Envoi...' : 'Renvoyer l\'email'}
                                </Button>

                                <Link href="/auth/login">
                                    <Button variant="ghost" className="w-full h-11 rounded-xl text-[var(--text-muted)] hover:text-white">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Retour à la connexion
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
