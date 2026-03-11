'use client';

// Page de gestion des membres d'équipe (chef d'équipe uniquement pour les contrats).
// Le chef peut modifier le type de contrat, secteur et temps de travail de chaque membre.
// Ces paramètres impactent le calcul automatique des soldes de congés.

import { useEffect, useState } from 'react';
import {
  Users, Crown, User, Copy, Check, ChevronDown,
  Briefcase, Building2, Clock, Save, Loader2, Settings2
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { doc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useTeam } from '@/contexts/team-context';
import { EmployeeType, WorkTimeCategory, SectorType } from '@/types/firestore';
import { calculateInitialLeaveBalance } from '@/lib/firebase/balances';
import { CONTRACT_TYPES, WORK_TIME_CATEGORIES } from '@/constants/contracts';

// ──────────────────────────────────────────────────────────────
// Type for the editable contract panel
// ──────────────────────────────────────────────────────────────
interface MemberContractEdit {
  userId: string;
  employeeType: EmployeeType;
  workTimeCategory: WorkTimeCategory;
  workTimePercentage: number;
  sector: SectorType;
}

export default function TeamMembersPage() {
  const { team, members, isLeader, loading, refreshTeam } = useTeam();
  const [copied, setCopied] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [contractEdits, setContractEdits] = useState<Record<string, MemberContractEdit>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { refreshTeam(); }, [refreshTeam]);

  const copyCode = async () => {
    if (!team?.code) return;
    await navigator.clipboard.writeText(team.code);
    setCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  // Initialize edit values from the member's current profile in Firestore
  const openContractPanel = async (userId: string) => {
    if (!db) return;
    if (editingMember === userId) {
      setEditingMember(null);
      return;
    }
    if (!contractEdits[userId]) {
      const snap = await getDoc(doc(db, 'profiles', userId));
      const data = snap.data();
      setContractEdits(prev => ({
        ...prev,
        [userId]: {
          userId,
          employeeType: data?.employeeType || 'cdi',
          workTimeCategory: data?.workTimeCategory || 'temps-plein',
          workTimePercentage: data?.workTimePercentage || 100,
          sector: data?.sector || 'prive',
        }
      }));
    }
    setEditingMember(userId);
  };

  const updateContract = (userId: string, field: keyof MemberContractEdit, value: unknown) => {
    setContractEdits(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  // Save contract changes + recalculate leave balance
  const saveContract = async (userId: string) => {
    if (!db) return;
    const edit = contractEdits[userId];
    if (!edit) return;
    setSaving(userId);

    try {
      const newBalance = calculateInitialLeaveBalance(
        edit.employeeType,
        edit.sector,
        edit.workTimeCategory,
        edit.workTimePercentage
      );

      await updateDoc(doc(db, 'profiles', userId), {
        employeeType: edit.employeeType,
        workTimeCategory: edit.workTimeCategory,
        workTimePercentage: edit.workTimePercentage,
        sector: edit.sector,
        leaveBalance: { total: newBalance, used: 0, remaining: newBalance },
        updatedAt: Timestamp.now(),
      });

      toast.success('Contrat mis à jour — solde de congés recalculé');
      setEditingMember(null);
      refreshTeam();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(null);
    }
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{team.name}</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {members.length} membre{members.length > 1 ? 's' : ''}
              {isLeader && ' · Vous êtes chef d\'équipe'}
            </p>
          </div>
        </div>
        {isLeader && (
          <Link href="/team/settings" className="btn btn-secondary">
            <Settings2 className="w-4 h-4" />
            Paramètres
          </Link>
        )}
      </div>

      {/* Team Code */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Code d&apos;invitation</p>
            <p className="text-xl font-mono font-bold text-[var(--accent)] tracking-wider">{team.code}</p>
          </div>
          <button type="button" onClick={copyCode} className="btn btn-secondary">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Partagez ce code pour inviter de nouveaux membres
        </p>
      </div>

      {/* Leader info banner */}
      {isLeader && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-[var(--text-secondary)]">
            En tant que chef d&apos;équipe, vous pouvez modifier le type de contrat et le secteur de chaque membre.
            Cela recalcule automatiquement leur solde de congés.
          </p>
        </div>
      )}

      {/* Members List */}
      <div className="card divide-y divide-[var(--border-subtle)]">
        <div className="p-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Membres de l&apos;équipe</h2>
        </div>

        {members.map((member, index) => {
          const isEditing = editingMember === member.user_id;
          const edit = contractEdits[member.user_id];

          return (
            <div
              key={member.id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Member Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.role === 'leader' ? 'bg-amber-500/10' : 'bg-[var(--bg-secondary)]'
                    }`}>
                    {member.role === 'leader'
                      ? <Crown className="w-5 h-5 text-amber-500" />
                      : <User className="w-5 h-5 text-[var(--text-muted)]" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {member.profile?.full_name ||
                        `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() ||
                        member.profile?.email || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{member.profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${member.role === 'leader'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                    }`}>
                    {member.role === 'leader' ? 'Chef d\'équipe' : 'Membre'}
                  </span>

                  {/* Contract management button — only for leader, only for non-leader members */}
                  {isLeader && member.role !== 'leader' && (
                    <button
                      type="button"
                      onClick={() => openContractPanel(member.user_id)}
                      className="btn btn-secondary text-xs"
                      aria-label={`Modifier le contrat de ${member.profile?.full_name || member.profile?.email || 'membre'}`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Contrat
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isEditing ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Contract Edit Panel — visible only when expanded */}
              {isEditing && edit && (
                  <div
                    className="overflow-hidden transition-all duration-200"
                  >
                    <div className="px-4 pb-4 bg-[var(--bg-overlay)] mx-4 mb-4 rounded-2xl border border-white/5 space-y-4">
                      <p className="text-xs text-[var(--text-muted)] pt-4 font-medium uppercase tracking-wide">
                        Configuration du contrat
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Type de contrat */}
                        <div className="space-y-1">
                          <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> Type de contrat
                          </label>
                          <select
                            value={edit.employeeType}
                            onChange={e => updateContract(member.user_id, 'employeeType', e.target.value as EmployeeType)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                          >
                            {CONTRACT_TYPES.map(ct => (
                              <option key={ct.id} value={ct.id}>{ct.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Secteur */}
                        <div className="space-y-1">
                          <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Secteur
                          </label>
                          <select
                            value={edit.sector}
                            onChange={e => updateContract(member.user_id, 'sector', e.target.value as SectorType)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                          >
                            <option value="prive">Privé</option>
                            <option value="public">Public</option>
                          </select>
                        </div>

                        {/* Catégorie de temps */}
                        <div className="space-y-1">
                          <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Temps de travail
                          </label>
                          <select
                            value={edit.workTimeCategory}
                            onChange={e => updateContract(member.user_id, 'workTimeCategory', e.target.value as WorkTimeCategory)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                          >
                            {WORK_TIME_CATEGORIES.map(wt => (
                              <option key={wt.id} value={wt.id}>{wt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Pourcentage (temps partiel seulement) */}
                        {edit.workTimeCategory === 'temps-partiel' && (
                          <div className="space-y-1">
                            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pourcentage
                            </label>
                            <input
                              type="number"
                              min={50} max={99} step={5}
                              value={edit.workTimePercentage}
                              onChange={e => updateContract(member.user_id, 'workTimePercentage', Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Save button */}
                      <button
                        type="button"
                        onClick={() => saveContract(member.user_id)}
                        disabled={saving === member.user_id}
                        className="btn btn-primary w-full"
                      >
                        {saving === member.user_id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Save className="w-4 h-4" />
                        }
                        Enregistrer et recalculer les congés
                      </button>
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
