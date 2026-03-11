'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { Users, Shield, ArrowRight, Loader2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { authFetch } from '@/lib/auth-fetch';
import { useTeam } from '@/contexts/team-context';
import { toast } from 'sonner';

export default function CreateTeamPage() {
  const { user } = useAuth();
  const { refreshTeam } = useTeam();
  const [teamName, setTeamName] = useState('');
  const [allowMemberInvite, setAllowMemberInvite] = useState(true);
  const [autoApproveAbsences, setAutoApproveAbsences] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!teamName.trim()) {
      toast.error('Veuillez donner un nom à votre équipe');
      return;
    }

    setLoading(true);

    try {
      const response = await authFetch('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: teamName,
          settings: {
            allowMemberInvite,
            autoApproveAbsences
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const data = await response.json();
      toast.success(`Équipe "${teamName}" créée !`);
      await refreshTeam();
      router.push(`/team/success?code=${data.team.code}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      <div
        className="w-full max-w-xl animate-scale-in"
      >
        <Card className="glass-elevated border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[var(--blueprint-500)] to-[var(--cyan-500)]" />

          <CardHeader className="pt-8 pb-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <Shield className="w-8 h-8 text-[var(--blueprint-500)]" />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text-amber">Créer une équipe</CardTitle>
            <CardDescription className="text-[var(--text-tertiary)] pt-2">
              Devenez administrateur et configurez votre espace de gestion
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="create-team-form" onSubmit={handleCreateTeam} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-sm font-medium">Nom de l'équipe / Organisation</Label>
                <div className="relative group">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--blueprint-500)] transition-colors" />
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="ex: Département Marketing, Team Dev..."
                    className="pl-10 h-12 bg-[var(--bg-overlay)] border-[var(--border-strong)] rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--blueprint-500)]" />
                  Paramètres de collaboration
                </h3>

                <div className="grid gap-4">
                  <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-default)] hover:border-[var(--blueprint-500)]/30 transition-colors cursor-pointer">
                    <Checkbox
                      id="allowMemberInvite"
                      checked={allowMemberInvite}
                      onCheckedChange={(checked) => setAllowMemberInvite(!!checked)}
                      className="mt-1 border-white/20 data-[state=checked]:bg-[var(--blueprint-500)]"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="allowMemberInvite" className="text-sm font-bold text-white cursor-pointer">
                        Autoriser les membres à inviter
                      </Label>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Les membres pourront générer des liens d'invitation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-default)] hover:border-[var(--blueprint-500)]/30 transition-colors cursor-pointer">
                    <Checkbox
                      id="autoApproveAbsences"
                      checked={autoApproveAbsences}
                      onCheckedChange={(checked) => setAutoApproveAbsences(!!checked)}
                      className="mt-1 border-white/20 data-[state=checked]:bg-[var(--blueprint-500)]"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="autoApproveAbsences" className="text-sm font-bold text-white cursor-pointer">
                        Approuver automatiquement
                      </Label>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Les télétravails et présences sont validés sans revue
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="pb-8 pt-4 flex flex-col gap-4">
            <Button
              type="submit"
              form="create-team-form"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-bold text-base transition-all shadow-lg shadow-sky-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Confirmer et Créer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-[var(--text-muted)] px-8">
              En créant une équipe, vous devenez le responsable légal des données de vos membres.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
