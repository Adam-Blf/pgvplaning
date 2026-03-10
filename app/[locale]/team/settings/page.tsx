'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Settings, ArrowLeft, Save, Trash2, LogOut, Loader2, AlertTriangle, Copy, Check, Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { useTeam } from '@/contexts/team-context';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function TeamSettingsPage() {
  const router = useRouter();
  const { team, isLeader, loading: teamLoading, refreshTeam } = useTeam();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minPresence, setMinPresence] = useState(0);
  const [allowMemberInvite, setAllowMemberInvite] = useState(true);
  const [autoApproveAbsences, setAutoApproveAbsences] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || '');
      setMinPresence(team.settings?.minPresenceRequired || 0);
      setAllowMemberInvite(team.settings?.allowMemberInvite ?? true);
      setAutoApproveAbsences(team.settings?.autoApproveAbsences ?? false);
    }
  }, [team]);

  useEffect(() => {
    // Redirect non-leaders
    if (!teamLoading && !isLeader && team) {
      router.push('/team/members');
    }
  }, [teamLoading, isLeader, team, router]);

  const copyCode = async () => {
    if (!team?.code) return;
    try {
      await navigator.clipboard.writeText(team.code);
      setCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleSave = async () => {
    if (!team || !name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          settings: {
            ...team.settings,
            minPresenceRequired: minPresence,
            allowMemberInvite,
            autoApproveAbsences
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      await refreshTeam();
      toast.success('Équipe mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!team) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      toast.success('Équipe supprimée');
      router.push('/team/setup');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLeave = async () => {
    if (!team) return;

    setLeaving(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }

      toast.success('Vous avez quitté l\'équipe');
      router.push('/team/setup');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!team || !isLeader) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/team/members"
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Paramètres de l&apos;équipe
          </h1>
        </div>
      </div>

      {/* Team Code */}
      <div className="card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Code d&apos;invitation</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 p-4 rounded-lg bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-default)]">
            <p className="text-2xl font-mono font-bold text-center text-[var(--accent)] tracking-[0.3em]">
              {team.code}
            </p>
          </div>
          <button onClick={copyCode} className="btn btn-secondary">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Partagez ce code pour inviter de nouveaux membres
        </p>
      </div>

      {/* Team Info */}
      <div className="card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Informations de l&apos;équipe</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Nom de l&apos;équipe
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Présence minimale obligatoire
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Nombre de membres qui doivent obligatoirement être présents. Les demandes de congés qui bloquent cette présence minimale seront bloquées ou marquées d'un avertissement.
            </p>
            <input
              type="number"
              min="0"
              value={minPresence}
              onChange={(e) => setMinPresence(parseInt(e.target.value) || 0)}
              className="input w-32"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Paramètres de collaboration
            </h3>

            <div className="grid gap-4">
              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                <Checkbox
                  id="allowMemberInvite"
                  checked={allowMemberInvite}
                  onCheckedChange={(checked) => setAllowMemberInvite(!!checked)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="allowMemberInvite" className="text-sm font-bold text-[var(--text-primary)] cursor-pointer">
                    Autoriser les membres à inviter
                  </Label>
                  <p className="text-xs text-[var(--text-muted)]">
                    Les membres pourront générer des liens d&apos;invitation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                <Checkbox
                  id="autoApproveAbsences"
                  checked={autoApproveAbsences}
                  onCheckedChange={(checked) => setAutoApproveAbsences(!!checked)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="autoApproveAbsences" className="text-sm font-bold text-[var(--text-primary)] cursor-pointer">
                    Approuver automatiquement
                  </Label>
                  <p className="text-xs text-[var(--text-muted)]">
                    Les télétravails et présences sont validés sans revue
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="btn btn-primary mt-6"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-500/20">
        <h2 className="font-semibold text-red-500 mb-4">Zone de danger</h2>

        <div className="space-y-4">
          {/* Leave Team */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Quitter l&apos;équipe</p>
              <p className="text-sm text-[var(--text-muted)]">
                Vous perdrez l&apos;accès au calendrier partagé
              </p>
            </div>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="btn bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
            >
              <LogOut className="w-4 h-4" />
              Quitter
            </button>
          </div>

          {/* Delete Team */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Supprimer l&apos;équipe</p>
              <p className="text-sm text-[var(--text-muted)]">
                Cette action est irréversible
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn bg-red-500/10 text-red-500 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Quitter l&apos;équipe ?
              </h3>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              Êtes-vous sûr de vouloir quitter <strong>{team.name}</strong> ?
              Vous devrez être réinvité pour rejoindre à nouveau.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="btn bg-amber-500 text-white hover:bg-amber-600"
              >
                {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Quitter'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Supprimer l&apos;équipe ?
              </h3>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              Cette action est <strong>irréversible</strong>. Toutes les données
              de l&apos;équipe, y compris les calendriers de tous les membres, seront
              définitivement supprimées.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer définitivement'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
