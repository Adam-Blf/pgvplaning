'use client';

import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    Clock,
    Search,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { useTeam } from '@/contexts/team-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

export default function MemberValidationPage() {
    const { members, isLeader, isLeaderOrMod, approveMember, loading, refreshTeam } = useTeam();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const pendingMembers = useMemo(() => {
        return members.filter(m => m.status === 'pending');
    }, [members]);

    const handleApprove = async (id: string, name: string) => {
        setProcessingId(id);
        try {
            await approveMember(id);
            toast.success(`${name} est maintenant membre de l'équipe.`);
        } catch (error) {
            toast.error("Erreur lors de la validation.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string, name: string) => {
        setRejectingId(id);
        try {
            const { db } = await import('@/lib/firebase/client');
            if (!db) throw new Error('Firestore not initialized');
            const { deleteDoc, doc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'team_members', id));
            toast.success(`${name} a été retiré de la liste.`);
            await refreshTeam();
        } catch {
            toast.error("Erreur lors du rejet.");
        } finally {
            setRejectingId(null);
        }
    };

    if (!isLeaderOrMod && !loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Card className="max-w-md border-rose-500/20 bg-rose-500/5 rounded-2xl">
                    <CardContent className="p-8 text-center space-y-4">
                        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
                        <h2 className="text-xl font-bold text-white">Accès Refusé</h2>
                        <p className="text-muted-foreground">Seuls les leaders d'équipe peuvent valider les nouveaux membres.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[var(--blueprint-500)]/10 border border-[var(--blueprint-500)]/20">
                        <ShieldCheck className="w-8 h-8 text-[var(--blueprint-500)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight gradient-text-amber">Validation SaaS</h1>
                        <p className="text-muted-foreground">Gérez les accès à votre organisation</p>
                    </div>
                </div>

                <div className="bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-full px-4 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-sm font-medium">{pendingMembers.length} demande(s) en attente</span>
                </div>
            </div>

            <div className="grid gap-6">
                    {pendingMembers.length === 0 ? (
                        <div
                            className="text-center py-20 glass border border-dashed border-[var(--border-default)] rounded-3xl animate-fade-up opacity-0"
                        >
                            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold opacity-50">Aucune demande en attente</h2>
                            <p className="text-muted-foreground">Votre équipe est à jour.</p>
                        </div>
                    ) : (
                        pendingMembers.map((member) => (
                            <div
                                key={member.id}
                                className="group animate-scale-in"
                            >
                                <Card className="glass-elevated border-[var(--border-default)] hover:border-[var(--blueprint-500)]/30 transition-all rounded-2xl overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-overlay)] border border-[var(--border-default)] flex items-center justify-center text-xl font-bold text-white uppercase">
                                                    {member.profile?.displayName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">
                                                        {member.profile?.displayName || 'Nouvel Utilisateur'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Inscrit le {new Date(member.joined_at).toLocaleDateString()}
                                                    </div>
                                                    <p className="text-xs font-mono text-[var(--blueprint-500)] uppercase tracking-widest mt-1">
                                                        {member.profile?.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => handleReject(member.id, member.profile?.displayName || '')}
                                                    disabled={rejectingId === member.id || processingId === member.id}
                                                    className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                >
                                                    {rejectingId === member.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <UserX className="w-4 h-4 mr-2" />
                                                            Rejeter
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleApprove(member.id, member.profile?.displayName || '')}
                                                    disabled={processingId === member.id || rejectingId === member.id}
                                                    className="rounded-xl bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-bold shadow-lg shadow-sky-500/20"
                                                >
                                                    {processingId === member.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <UserCheck className="w-4 h-4 mr-2" />
                                                            Approuver
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    )}
            </div>

            <div className="rounded-3xl bg-[var(--blueprint-500)]/5 border border-[var(--blueprint-500)]/10 p-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--blueprint-500)]/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[var(--blueprint-500)]" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-white">Sécurité Premium</h4>
                        <p className="text-sm text-muted-foreground">
                            Cette zone permet de prévenir les attaques par brute-force sur les codes d'invitation.
                            Même avec un code valide, une approbation humaine est requise.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
