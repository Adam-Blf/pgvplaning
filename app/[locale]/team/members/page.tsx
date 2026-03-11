'use client';

import { useEffect, useState } from 'react';
import {
  Users, UserPlus, Settings, Trash2, Shield, ShieldCheck, Crown,
  Copy, ChevronDown, ChevronUp, Loader2, AlertTriangle, Clock, Gift, Save
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase/client';
import { useTeam } from '@/contexts/team-context';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────────
// Local state types
// ──────────────────────────────────────────────────────────────
interface PreCreateForm {
  first_name: string;
  last_name: string;
  email: string;
  weeklyHours: number;
  role: 'member' | 'moderator';
}

interface MemberEdit {
  weeklyHours: number;
  bonusDays: number;
  recoveryHours: number;
  role: 'member' | 'moderator';
  annual_leave_days: number;
}

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-strong)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20';

export default function TeamMembersPage() {
  const {
    team, members, isLeader, isLeaderOrMod, loading,
    refreshTeam, updateMemberSettings, removeMember, approveMember, deleteTeam,
  } = useTeam();

  // Pre-create form
  const [preCreateOpen, setPreCreateOpen] = useState(false);
  const [preForm, setPreForm] = useState<PreCreateForm>({
    first_name: '', last_name: '', email: '', weeklyHours: 38, role: 'member',
  });
  const [preCreating, setPreCreating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  // Member editing
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [memberEdits, setMemberEdits] = useState<Record<string, MemberEdit>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { refreshTeam(); }, [refreshTeam]);

  // ── Pre-create ──────────────────────────────────────────────
  const handlePreCreate = async () => {
    if (!preForm.first_name || !preForm.last_name || !preForm.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setPreCreating(true);
    setGeneratedLink(null);
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) { toast.error('Non authentifié'); return; }
      const res = await fetch('/api/teams/pre-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          first_name: preForm.first_name,
          last_name: preForm.last_name,
          email: preForm.email,
          weeklyHours: preForm.weeklyHours,
          role: preForm.role,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur serveur');
      const data = await res.json();
      setGeneratedLink(data.link);
      toast.success('Membre pré-créé — lien généré');
      setPreForm({ first_name: '', last_name: '', email: '', weeklyHours: 38, role: 'member' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la pré-création');
    } finally {
      setPreCreating(false);
    }
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    toast.success('Lien copié !');
  };

  // ── Member editing helpers ──────────────────────────────────
  const toggleEdit = (member: typeof members[0]) => {
    const id = member.id;
    if (editingMember === id) { setEditingMember(null); return; }
    if (!memberEdits[id]) {
      setMemberEdits(prev => ({
        ...prev,
        [id]: {
          weeklyHours: member.weeklyHours ?? 38,
          bonusDays: member.bonusDays ?? 0,
          recoveryHours: member.recoveryHours ?? 0,
          role: (member.role === 'leader' ? 'member' : member.role) as 'member' | 'moderator',
          annual_leave_days: member.annual_leave_days ?? 0,
        },
      }));
    }
    setEditingMember(id);
  };

  const updateEdit = (id: string, field: keyof MemberEdit, value: number | string) => {
    setMemberEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveEdit = async (memberId: string) => {
    const edit = memberEdits[memberId];
    if (!edit) return;
    setSaving(memberId);
    try {
      await updateMemberSettings(memberId, {
        weeklyHours: edit.weeklyHours,
        bonusDays: edit.bonusDays,
        recoveryHours: edit.recoveryHours,
        role: edit.role,
        annual_leave_days: edit.annual_leave_days,
      });
      toast.success('Paramètres du membre mis à jour');
      setEditingMember(null);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(null);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer ${name} de l'équipe ?`)) return;
    try {
      await removeMember(memberId);
      toast.success('Membre retiré');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette équipe ? Cette action est irréversible.')) return;
    if (!window.confirm('Confirmez une dernière fois : SUPPRIMER définitivement l\'équipe et tous ses membres ?')) return;
    try {
      await deleteTeam();
      toast.success('Équipe supprimée');
    } catch {
      toast.error('Erreur lors de la suppression de l\'équipe');
    }
  };

  // ── Derived data ────────────────────────────────────────────
  const approvedMembers = members.filter(m => m.status === 'approved');
  const pendingMembers = members.filter(m => m.status === 'pending');

  const getMemberName = (m: typeof members[0]) =>
    m.profile?.full_name ||
    `${m.profile?.first_name || ''} ${m.profile?.last_name || ''}`.trim() ||
    m.profile?.email || 'Utilisateur';

  const roleBadge = (role: string) => {
    switch (role) {
      case 'leader':
        return 'bg-blue-500/15 text-blue-400';
      case 'moderator':
        return 'bg-violet-500/15 text-violet-400';
      default:
        return 'bg-[var(--bg-secondary)] text-[var(--text-muted)]';
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'leader': return 'Chef';
      case 'moderator': return 'Modérateur';
      default: return 'Membre';
    }
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4" />;
      case 'moderator': return <ShieldCheck className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  // ── Loading / empty states ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-muted)]">Aucune équipe trouvée</p>
        <Link href="/team/setup" className="btn btn-primary mt-4">Rejoindre une équipe</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--blueprint-500)]/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-[var(--blueprint-500)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text-amber">{team.name} — Membres</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {approvedMembers.length} membre{approvedMembers.length > 1 ? 's' : ''}
            {pendingMembers.length > 0 && ` · ${pendingMembers.length} en attente`}
          </p>
        </div>
      </div>

      {/* ── Pre-create form (leader / mod) ─────────────────── */}
      {isLeaderOrMod && (
        <div className="glass-elevated rounded-2xl">
          <button
            type="button"
            onClick={() => { setPreCreateOpen(o => !o); setGeneratedLink(null); }}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <UserPlus className="w-5 h-5 text-[var(--blueprint-500)]" />
              Pré-créer un membre
            </span>
            {preCreateOpen
              ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
              : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
          </button>

          {preCreateOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">Prénom</label>
                  <input
                    type="text"
                    value={preForm.first_name}
                    onChange={e => setPreForm(p => ({ ...p, first_name: e.target.value }))}
                    className={inputClass}
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">Nom</label>
                  <input
                    type="text"
                    value={preForm.last_name}
                    onChange={e => setPreForm(p => ({ ...p, last_name: e.target.value }))}
                    className={inputClass}
                    placeholder="Dupont"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">Email</label>
                  <input
                    type="email"
                    value={preForm.email}
                    onChange={e => setPreForm(p => ({ ...p, email: e.target.value }))}
                    className={inputClass}
                    placeholder="jean@exemple.be"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Heures/semaine
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={preForm.weeklyHours}
                    onChange={e => setPreForm(p => ({ ...p, weeklyHours: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs text-[var(--text-secondary)]">Rôle</label>
                  <select
                    value={preForm.role}
                    onChange={e => setPreForm(p => ({ ...p, role: e.target.value as 'member' | 'moderator' }))}
                    className={inputClass}
                  >
                    <option value="member">Membre</option>
                    <option value="moderator">Modérateur</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePreCreate}
                disabled={preCreating}
                className="btn btn-primary w-full"
              >
                {preCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Créer &amp; Envoyer lien
              </button>

              {generatedLink && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 bg-transparent text-sm text-emerald-300 outline-none truncate"
                  />
                  <button type="button" onClick={copyLink} className="btn btn-secondary shrink-0">
                    <Copy className="w-4 h-4" /> Copier
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Approved members list ──────────────────────────── */}
      <div className="glass-elevated rounded-2xl divide-y divide-[var(--border-subtle)]">
        <div className="p-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Membres de l&apos;équipe</h2>
        </div>

        {approvedMembers.length === 0 && (
          <p className="p-4 text-sm text-[var(--text-muted)]">Aucun membre approuvé.</p>
        )}

        {approvedMembers.map((member, index) => {
          const isEditing = editingMember === member.id;
          const edit = memberEdits[member.id];
          const name = getMemberName(member);

          return (
            <div
              key={member.id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Row */}
              <div className="p-4 flex items-center justify-between hover:bg-[var(--bg-overlay)]/50 transition-colors">
                <div className="flex items-center gap-3">
                  {member.profile?.color && (
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: member.profile.color }}
                    />
                  )}
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{member.profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-1 rounded-full flex items-center gap-1', roleBadge(member.role))}>
                    {roleIcon(member.role)} {roleLabel(member.role)}
                  </span>

                  {isLeaderOrMod && member.role !== 'leader' && (
                    <button
                      type="button"
                      onClick={() => toggleEdit(member)}
                      className="btn btn-secondary text-xs"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      {isEditing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && edit && (
                <div className="px-4 pb-4">
                  <div className="bg-[var(--bg-overlay)] p-4 rounded-2xl border border-[var(--border-default)] space-y-4">
                    <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
                      Paramètres du membre
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Heures/semaine
                        </label>
                        <input
                          type="number" min={0}
                          value={edit.weeklyHours}
                          onChange={e => updateEdit(member.id, 'weeklyHours', Number(e.target.value))}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <Gift className="w-3 h-3" /> Jours bonus
                        </label>
                        <input
                          type="number" min={0} max={3}
                          value={edit.bonusDays}
                          onChange={e => updateEdit(member.id, 'bonusDays', Number(e.target.value))}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Heures récup
                        </label>
                        <input
                          type="number" min={0}
                          value={edit.recoveryHours}
                          onChange={e => updateEdit(member.id, 'recoveryHours', Number(e.target.value))}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Rôle
                        </label>
                        <select
                          value={edit.role}
                          onChange={e => updateEdit(member.id, 'role', e.target.value)}
                          className={inputClass}
                        >
                          <option value="member">Membre</option>
                          <option value="moderator">Modérateur</option>
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                          <Gift className="w-3 h-3" /> Solde CP annuel
                        </label>
                        <input
                          type="number" min={0}
                          value={edit.annual_leave_days}
                          onChange={e => updateEdit(member.id, 'annual_leave_days', Number(e.target.value))}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(member.id)}
                        disabled={saving === member.id}
                        className="btn btn-primary flex-1"
                      >
                        {saving === member.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Save className="w-4 h-4" />}
                        Enregistrer
                      </button>

                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id, name)}
                          className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pending members ────────────────────────────────── */}
      {pendingMembers.length > 0 && (
        <div className="glass-elevated rounded-2xl divide-y divide-[var(--border-subtle)]">
          <div className="p-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-[var(--text-primary)]">
              En attente d&apos;approbation ({pendingMembers.length})
            </h2>
          </div>

          {pendingMembers.map(member => {
            const name = getMemberName(member);
            return (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {member.profile?.color && (
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: member.profile.color }}
                    />
                  )}
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{member.profile?.email}</p>
                  </div>
                </div>

                {isLeaderOrMod && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try { await approveMember(member.id); toast.success(`${name} approuvé`); }
                        catch { toast.error('Erreur lors de l\'approbation'); }
                      }}
                      className="btn btn-primary text-xs"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id, name)}
                      className="btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete team (leader only) ──────────────────────── */}
      {isLeader && (
        <div className="glass-elevated rounded-2xl p-4">
          <button
            type="button"
            onClick={handleDeleteTeam}
            className="btn w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer l&apos;équipe
          </button>
        </div>
      )}
    </div>
  );
}
