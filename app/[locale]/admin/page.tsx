'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserMinus,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatedBlueprintIcon } from '@/components/ui/animated-blueprint-icon';
import { authFetch } from '@/lib/auth-fetch';

interface Profile {
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface Member {
  id: string;
  user_id: string;
  role: 'member' | 'admin' | 'leader';
  employee_type: string;
  annual_leave_days: number;
  leave_balance: number;
  joined_at: string;
  profiles: Profile;
}

interface Team {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sector: string;
  default_leave_days: number;
  created_at: string;
}

interface CurrentUser {
  id: string;
  email: string;
  role: string;
  isTeamAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function AdminDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Settings form state
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [defaultLeaveDays, setDefaultLeaveDays] = useState(25);
  const [savingSettings, setSavingSettings] = useState(false);

  const [editingLeaveMember, setEditingLeaveMember] = useState<Member | null>(null);
  const [editAnnualLeaves, setEditAnnualLeaves] = useState(0);
  const [editLeaveBalance, setEditLeaveBalance] = useState(0);
  const [savingLeaves, setSavingLeaves] = useState(false);

  const openLeaveEditor = (member: Member) => {
    setEditingLeaveMember(member);
    setEditAnnualLeaves(member.annual_leave_days);
    setEditLeaveBalance(member.leave_balance);
  };

  const handleSaveLeaves = async () => {
    if (!editingLeaveMember) return;
    setSavingLeaves(true);

    try {
      const response = await authFetch('/api/admin/members', {
        method: 'PATCH',
        body: JSON.stringify({
          memberId: editingLeaveMember.id,
          action: 'update-leaves',
          annualLeaves: editAnnualLeaves,
          leaveBalance: editLeaveBalance
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success('Soldes de congés mis à jour');
      await fetchData();
      setEditingLeaveMember(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setSavingLeaves(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/members');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setTeam(data.team);
      setMembers(data.members);
      setCurrentUser(data.currentUser);

      // Initialize settings form
      if (data.team) {
        setTeamName(data.team.name);
        setTeamDescription(data.team.description || '');
        setDefaultLeaveDays(data.team.default_leave_days || 25);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMemberAction = async (memberId: string, action: 'promote' | 'demote' | 'remove') => {
    setActionLoading(memberId);

    try {
      const response = await authFetch('/api/admin/members', {
        method: 'PATCH',
        body: JSON.stringify({ memberId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);

    try {
      const response = await authFetch('/api/admin/team', {
        method: 'PATCH',
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
          defaultLeaveDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('Paramètres sauvegardés');
      await fetchData();
      setShowSettings(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    } finally {
      setSavingSettings(false);
    }
  };

  const getMemberName = (member: Member) => {
    const profile = member.profiles;
    if (profile.full_name) return profile.full_name;
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email.split('@')[0];
  };

  const getInitials = (member: Member) => {
    const name = getMemberName(member);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role: string, isCurrentUserSuperAdmin: boolean, memberEmail: string) => {
    // Check if this member is super admin
    if (isCurrentUserSuperAdmin && memberEmail === currentUser?.email) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-blueprint-500/20 text-blueprint-400 border border-blueprint-500/30 glow-amber-sm">
          <AnimatedBlueprintIcon name="Admin" className="w-3.5 h-3.5" animateOnMount={false} />
          SUPER ADMIN
        </span>
      );
    }

    switch (role) {
      case 'leader':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-blueprint-500/10 text-blueprint-500 border border-blueprint-500/30">
            <AnimatedBlueprintIcon name="Admin" className="w-3.5 h-3.5" />
            CRÉATEUR
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <AnimatedBlueprintIcon name="Security" className="w-3.5 h-3.5" />
            ADMIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <AnimatedBlueprintIcon name="Team" className="w-3.5 h-3.5" />
            MEMBRE
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-blueprint-500/30 border-t-blueprint-500 rounded-full animate-spin" />
          <p className="text-blueprint-500 font-mono text-xs tracking-widest animate-pulse">CHARGEMENT DU SYSTÈME...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser?.isTeamAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20 glow-error-sm">
            <AnimatedBlueprintIcon name="Security" className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Accès Restreint</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">Le protocole de sécurité nécessite des privilèges d&apos;administrateur pour accéder à ce terminal.</p>
          <Link href="/calendar" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blueprint-500/10 text-blueprint-500 hover:bg-blueprint-500 hover:text-white transition-all font-mono text-sm border border-blueprint-500/20">
            ← RETOUR AU CALENDRIER
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] selection:bg-blueprint-500 selection:text-white">
      {/* Header */}
      <header className="relative border-b border-blueprint-500/10 bg-[var(--bg-elevated)]/80 backdrop-blur-xl z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/calendar"
                className="text-slate-500 hover:text-blueprint-400 transition-colors font-mono text-xs tracking-widest flex items-center gap-2"
              >
                <span>←</span> CALENDRIER
              </Link>
              <div className="w-px h-8 bg-blueprint-500/10" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blueprint-500/10 border border-blueprint-500/20 flex items-center justify-center glow-amber-sm">
                  <AnimatedBlueprintIcon name="Security" className="w-6 h-6 text-blueprint-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Administration</h1>
                  <p className="text-blueprint-500/60 text-xs font-mono tracking-wide mt-1">
                    {team?.name} • {members.length} OPÉRATEURS
                  </p>
                </div>
              </div>
            </div>

            {currentUser?.isSuperAdmin && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-2 rounded-xl bg-blueprint-500/10 border border-blueprint-500/30 glow-amber-sm"
              >
                <span className="text-blueprint-400 font-mono text-[10px] font-bold tracking-[0.2em] flex items-center gap-2">
                  <AnimatedBlueprintIcon name="Admin" className="w-4 h-4" />
                  SUPER ADMIN ACCESS
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="card-elevated group">
              <div className="p-6 border-b border-blueprint-500/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white flex items-center gap-3">
                    {team?.sector === 'public' ? (
                      <AnimatedBlueprintIcon name="Office" className="w-5 h-5 text-blueprint-500" />
                    ) : (
                      <AnimatedBlueprintIcon name="Tool" className="w-5 h-5 text-blueprint-400" />
                    )}
                    <span className="tracking-tight uppercase text-xs font-mono text-blueprint-500/80">Propriétés Équipe</span>
                  </h2>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-10 h-10 rounded-xl bg-blueprint-500/5 hover:bg-blueprint-500/20 text-blueprint-400 hover:text-blueprint-300 transition-all border border-blueprint-500/10 flex items-center justify-center"
                  >
                    <AnimatedBlueprintIcon name="Settings" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showSettings ? (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-blueprint-500/60 tracking-widest uppercase">
                        Nom de l&apos;équipe
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-blueprint-500/20 text-white text-sm focus:border-blueprint-500 focus:ring-4 focus:ring-blueprint-500/5 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-blueprint-500/60 tracking-widest uppercase">
                        Description technique
                      </label>
                      <textarea
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-blueprint-500/20 text-white text-sm focus:border-blueprint-500 focus:ring-4 focus:ring-blueprint-500/5 transition-all outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono font-bold text-blueprint-500/60 tracking-widest uppercase flex items-center gap-2">
                        <AnimatedBlueprintIcon name="Vacation" className="w-4 h-4" />
                        Base congés (jours/an)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={defaultLeaveDays}
                        onChange={(e) => setDefaultLeaveDays(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-blueprint-500/20 text-white text-sm focus:border-blueprint-500 focus:ring-4 focus:ring-blueprint-500/5 transition-all outline-none font-mono"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-500/10 text-slate-400 text-sm hover:bg-slate-500/20 transition-all border border-slate-500/10"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="flex-1 px-4 py-3 rounded-xl bg-blueprint-500 text-white text-sm font-bold hover:bg-blueprint-600 transition-all glow-amber-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingSettings ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Appliquer
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 space-y-6"
                  >
                    <div className="p-4 rounded-2xl bg-blueprint-500/5 border border-blueprint-500/10">
                      <p className="text-[10px] font-mono font-bold text-blueprint-500/40 tracking-widest uppercase mb-2">Code d&apos;accès terminal</p>
                      <p className="text-3xl font-mono text-blueprint-400 tracking-widest font-bold">{team?.code}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold text-blueprint-500/40 tracking-widest uppercase">Secteur</p>
                        <p className="text-sm text-white font-medium flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${team?.sector === 'public' ? 'bg-blueprint-500' : 'bg-cyan-400'}`} />
                          {team?.sector === 'public' ? 'Public' : 'Privé'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold text-blueprint-500/40 tracking-widest uppercase">Quotas</p>
                        <p className="text-sm text-white font-mono font-bold">{team?.default_leave_days || 25}j/AN</p>
                      </div>
                    </div>

                    {team?.description && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold text-blueprint-500/40 tracking-widest uppercase">Notes de mission</p>
                        <p className="text-sm text-slate-400 leading-relaxed italic">&quot;{team.description}&quot;</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4">
              {[
                { label: 'OPÉRATEURS ACTIFS', value: members.length, color: 'text-white', icon: 'Team' as const },
                { label: 'ADMINISTRATEURS', value: members.filter(m => m.role === 'admin' || m.role === 'leader').length, color: 'text-cyan-400', icon: 'Security' as const },
                { label: 'RATIO CONGÉS', value: Math.round(members.reduce((acc, m) => acc + m.leave_balance, 0) / (members.length || 1)), color: 'text-slate-400', icon: 'Vacation' as const },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-2xl bg-[var(--bg-elevated)] border border-blueprint-500/10 p-5 flex items-center justify-between group hover:border-blueprint-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blueprint-500/5 border border-blueprint-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AnimatedBlueprintIcon name={stat.icon} className="w-5 h-5 text-blueprint-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-blueprint-500/40 tracking-widest uppercase">{stat.label}</p>
                      <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Members List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="card-elevated">
              <div className="p-6 border-b border-blueprint-500/10 flex items-center justify-between bg-blueprint-500/[0.02]">
                <h2 className="font-bold text-white flex items-center gap-3">
                  <AnimatedBlueprintIcon name="Team" className="w-6 h-6 text-blueprint-500" />
                  <span className="tracking-tight uppercase text-xs font-mono text-blueprint-500/80">Registre des Membres</span>
                </h2>
                <div className="px-3 py-1 rounded-full bg-blueprint-500/10 border border-blueprint-500/20">
                  <span className="text-[10px] font-mono font-bold text-blueprint-400">{members.length} ENTRÉES</span>
                </div>
              </div>

              <div className="divide-y divide-blueprint-500/5">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="p-5 hover:bg-blueprint-500/[0.03] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blueprint-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-6">
                      {/* Avatar */}
                      <div className="relative">
                        {member.profiles.avatar_url ? (
                          <div className="relative w-14 h-14">
                            <Image
                              src={member.profiles.avatar_url}
                              alt=""
                              fill
                              className="rounded-2xl object-cover ring-2 ring-blueprint-500/10 group-hover:ring-blueprint-500/40 transition-all z-10"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-blueprint-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blueprint-900 to-blueprint-800 border border-blueprint-500/20 flex items-center justify-center group-hover:scale-105 transition-all">
                            <span className="text-lg font-mono font-bold text-blueprint-400">
                              {getInitials(member)}
                            </span>
                          </div>
                        )}
                        {/* Status Glow for leader */}
                        {member.role === 'leader' && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blueprint-500 rounded-lg flex items-center justify-center border-2 border-[var(--bg-base)] z-20 glow-amber-sm">
                            <AnimatedBlueprintIcon name="Admin" className="w-3 h-3 text-white" animateOnMount={false} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <p className="font-bold text-white tracking-tight text-lg group-hover:text-blueprint-400 transition-colors">
                            {getMemberName(member)}
                          </p>
                          {getRoleBadge(member.role, currentUser?.isSuperAdmin || false, member.profiles.email)}
                          {member.user_id === currentUser?.id && (
                            <span className="text-[10px] font-mono font-bold text-blueprint-500/40 tracking-widest">(CURRENT_USER)</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate font-mono mb-3">
                          {member.profiles.email}
                        </p>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blueprint-500/5 border border-blueprint-500/10 flex items-center justify-center">
                              <AnimatedBlueprintIcon name="Vacation" className="w-4 h-4 text-blueprint-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-slate-600 uppercase">Solde Congés</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-mono font-bold text-white">{member.leave_balance} / {member.annual_leave_days}j</p>
                                {currentUser?.isTeamAdmin && (
                                  <button
                                    onClick={() => openLeaveEditor(member)}
                                    className="p-1 rounded-md bg-blueprint-500/10 hover:bg-blueprint-500/20 text-blueprint-400 transition-colors"
                                    title="Modifier le solde"
                                  >
                                    <AnimatedBlueprintIcon name="Settings" className="w-3 h-3" animateOnMount={false} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-px h-8 bg-blueprint-500/5" />
                          <div>
                            <p className="text-[10px] font-mono text-slate-600 uppercase">Enrôlement</p>
                            <p className="text-xs font-mono font-bold text-slate-400">
                              {new Date(member.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {currentUser?.isTeamAdmin && member.user_id !== currentUser?.id && member.role !== 'leader' && (
                        <div className="flex items-center gap-2">
                          {member.role === 'member' ? (
                            <button
                              onClick={() => handleMemberAction(member.id, 'promote')}
                              disabled={actionLoading === member.id}
                              className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all border border-cyan-500/20 flex items-center justify-center"
                              title="Promouvoir au rang Admin"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ChevronUp className="w-5 h-5" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMemberAction(member.id, 'demote')}
                              disabled={actionLoading === member.id || (currentUser?.role !== 'leader' && !currentUser?.isSuperAdmin)}
                              className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
                              title="Rétrograder au rang Membre"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`RÉVOCATION : Souhaitez-vous retirer ${getMemberName(member)} de l'unité ?`)) {
                                handleMemberAction(member.id, 'remove');
                              }
                            }}
                            disabled={actionLoading === member.id}
                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 flex items-center justify-center"
                            title="Révoquer l'accès"
                          >
                            <UserMinus className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {members.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-blueprint-500/5 border border-blueprint-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-blueprint-500/20" />
                  </div>
                  <p className="text-slate-500 font-mono text-sm tracking-widest">UNITÉ VIDE : AUCUN OPÉRATEUR DÉTECTÉ</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 rounded-2xl bg-blueprint-500/5 border border-blueprint-500/10"
        >
          <div className="flex flex-wrap items-center gap-10">
            <span className="text-blueprint-500/40 font-mono text-[10px] font-bold tracking-[0.3em] uppercase underline decoration-blueprint-500/20 underline-offset-8">Protocoles & Terminaux</span>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronUp className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-slate-400 text-[11px] font-mono tracking-wide uppercase">Élévation Privilèges</span>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronDown className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-slate-400 text-[11px] font-mono tracking-wide uppercase">Rétrogradation (Lead Only)</span>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserMinus className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-slate-400 text-[11px] font-mono tracking-wide uppercase">Révocation Accès</span>
            </div>
          </div>
        </motion.div>

        {/* Modal Edition Congés */}
        <AnimatePresence>
          {editingLeaveMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingLeaveMember(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[var(--bg-elevated)] border border-blueprint-500/20 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-blueprint-500/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <AnimatedBlueprintIcon name="Vacation" className="w-5 h-5 text-blueprint-500" />
                    Édition des Congés
                  </h3>
                  <p className="text-sm font-mono text-slate-400 mt-1">
                    Cible : {getMemberName(editingLeaveMember)}
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold text-blueprint-500/60 tracking-widest uppercase">
                      Total Annuel (Jours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editAnnualLeaves}
                      onChange={(e) => setEditAnnualLeaves(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-blueprint-500/20 text-white font-mono focus:border-blueprint-500 focus:ring-4 focus:ring-blueprint-500/5 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold text-blueprint-500/60 tracking-widest uppercase">
                      Solde Restant (Jours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="-50"
                      max={editAnnualLeaves}
                      value={editLeaveBalance}
                      onChange={(e) => setEditLeaveBalance(Number(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-blueprint-500/20 text-white font-mono focus:border-blueprint-500 focus:ring-4 focus:ring-blueprint-500/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-blueprint-500/10 flex gap-3">
                  <button
                    onClick={() => setEditingLeaveMember(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-500/10 text-slate-400 font-bold hover:bg-slate-500/20 transition-all text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveLeaves}
                    disabled={savingLeaves}
                    className="flex-1 px-4 py-3 rounded-xl bg-blueprint-500 text-white font-bold hover:bg-blueprint-600 transition-all glow-amber-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {savingLeaves ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
