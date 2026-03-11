'use client';

import { UserPlus, Users, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--blueprint-500)] via-[var(--cyan-500)] to-[var(--blueprint-500)]" />

            <div
                className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-scale-in"
            >
                <Card className="glass-elevated border-white/10 shadow-2xl rounded-3xl group hover:border-[var(--blueprint-500)]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between">
                    <Link href="/team/create" className="absolute inset-0 z-10" />
                    <CardHeader className="pt-10 pb-6 text-center">
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                            <ShieldCheck className="w-10 h-10 text-[var(--blueprint-500)]" />
                        </div>
                <CardTitle className="text-3xl font-bold gradient-text-amber mb-3">Créer une équipe</CardTitle>
                        <CardDescription className="text-[var(--text-tertiary)] text-lg">
                            Devenez l&apos;administrateur et invitez vos collaborateurs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-10">
                        <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--blueprint-500)] shadow-[0_0_8px_var(--blueprint-500)]" />
                                Gestion des droits d&apos;accès
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--blueprint-500)] shadow-[0_0_8px_var(--blueprint-500)]" />
                                Configuration des types d&apos;absences
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--blueprint-500)] shadow-[0_0_8px_var(--blueprint-500)]" />
                                Tableau de bord administrateur
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 group-hover:bg-[var(--blueprint-500)] group-hover:text-white transition-all font-bold">
                            Continuer comme Leader
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-elevated border-white/10 shadow-2xl rounded-3xl group hover:border-[var(--cyan-500)]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between">
                    <Link href="/team/join" className="absolute inset-0 z-10" />
                    <CardHeader className="pt-10 pb-6 text-center">
                        <div className="mx-auto w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-500">
                            <UserCheck className="w-10 h-10 text-[var(--cyan-400)]" />
                        </div>
                <CardTitle className="text-3xl font-bold gradient-text-amber mb-3">Rejoindre une équipe</CardTitle>
                        <CardDescription className="text-[var(--text-tertiary)] text-lg">
                            Entrez le code fourni par votre responsable
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-10">
                        <ul className="space-y-3 mb-8 text-sm text-[var(--text-secondary)]">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-400)] shadow-[0_0_8px_var(--cyan-400)]" />
                                Accédez au planning commun
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-400)] shadow-[0_0_8px_var(--cyan-400)]" />
                                Gérez vos propres absences
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-400)] shadow-[0_0_8px_var(--cyan-400)]" />
                                Exportez vers vos calendriers ICS
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 group-hover:bg-[var(--cyan-500)] group-hover:text-white transition-all font-bold">
                            Continuer comme Membre
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
