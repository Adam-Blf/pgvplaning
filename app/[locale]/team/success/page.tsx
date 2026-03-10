'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Copy, Check, Shield, ArrowRight, Share2, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code') || 'ERREUR';
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copié dans le presse-papier !');
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl"
        >
            <Card className="glass-elevated border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="w-32 h-32" />
                </div>

                <CardHeader className="pt-10 pb-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20"
                    >
                        <Check className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <CardTitle className="text-3xl font-bold text-white">Équipe créée !</CardTitle>
                    <CardDescription className="text-[var(--text-tertiary)] pt-2 text-lg">
                        Votre espace Absencia est maintenant prêt.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 px-8">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--blueprint-500)] text-center">
                            Votre code d&apos;invitation unique
                        </h3>

                        <div className="relative group">
                            <div
                                onClick={copyToClipboard}
                                className="w-full h-16 bg-[var(--bg-overlay)] border border-white/10 rounded-xl flex items-center justify-center text-3xl font-mono font-bold tracking-[0.5em] text-white cursor-pointer hover:border-[var(--blueprint-500)]/50 transition-all group"
                            >
                                {code}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-[var(--text-muted)]" />}
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-[var(--text-muted)] font-medium">
                            Partagez ce code avec les membres que vous souhaitez inviter.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-start gap-3">
                            <Share2 className="w-5 h-5 text-[var(--blueprint-500)] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Partage facile</h4>
                                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                                    Envoyez ce code par email, Slack ou Teams.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-[var(--cyan-400)] shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Planning prêt</h4>
                                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                                    Commencez à poser vos jours et synchronisez vos calendriers.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pb-10 pt-4">
                    <Button
                        onClick={() => router.push('/')}
                        className="w-full h-12 rounded-xl bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        Accéder au Dashboard
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

export default function TeamSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
            <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-[var(--blueprint-500)]" />}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
