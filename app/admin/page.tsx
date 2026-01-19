'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  ShieldCheck,
  Crown,
  Settings,
  UserMinus,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  Calendar,
  Building2,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

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

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/members');
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
      const response = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
          <Sparkles className="w-3 h-3" />
          SUPER ADMIN
        </span>
      );
    }

    switch (role) {
      case 'leader':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Crown className="w-3 h-3" />
            CRÉATEUR
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            ADMIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
            <Users className="w-3 h-3" />
            MEMBRE
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-sm">CHARGEMENT DES DONNÉES...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentUser?.isTeamAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">Accès Refusé</h1>
          <p className="text-zinc-500 mb-6">Vous devez être admin pour accéder à cette page.</p>
          <Link href="/calendar" className="text-amber-500 hover:text-amber-400 font-mono text-sm">
            ← Retour au calendrier
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Grid pattern background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <header className="relative border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/calendar"
                className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-sm"
              >
                ← CALENDRIER
              </Link>
              <div className="w-px h-6 bg-zinc-800" />
              <div>
                <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Administration
                </h1>
                <p className="text-zinc-500 text-sm font-mono mt-0.5">
                  {team?.name} • {members.length} membres
                </p>
              </div>
            </div>

            {currentUser?.isSuperAdmin && (
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <span className="text-amber-500 font-mono text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  SUPER ADMIN MODE
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                    {team?.sector === 'public' ? (
                      <Building2 className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                    )}
                    Équipe
                  </h2>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
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
                    className="p-5 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-mono text-zinc-500 mb-1.5">
                        NOM DE L&apos;ÉQUIPE
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-500 mb-1.5">
                        DESCRIPTION
                      </label>
                      <textarea
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-500 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        JOURS DE CONGÉS / AN
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={defaultLeaveDays}
                        onChange={(e) => setDefaultLeaveDays(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                      />
                      <p className="text-xs text-zinc-600 mt-1.5">
                        S&apos;applique à tous les membres
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="flex-1 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 text-sm hover:bg-zinc-800 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="flex-1 px-3 py-2 rounded-lg bg-amber-500 text-zinc-900 text-sm font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingSettings ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Sauvegarder
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
                    className="p-5 space-y-4"
                  >
                    <div>
                      <p className="text-xs font-mono text-zinc-500 mb-1">CODE D&apos;INVITATION</p>
                      <p className="text-xl font-mono text-amber-500 tracking-wider">{team?.code}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-mono text-zinc-500 mb-1">SECTEUR</p>
                        <p className="text-sm text-zinc-300">
                          {team?.sector === 'public' ? 'Public' : 'Privé'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-zinc-500 mb-1">CONGÉS/AN</p>
                        <p className="text-sm text-zinc-300 font-mono">{team?.default_leave_days || 25} jours</p>
                      </div>
                    </div>

                    {team?.description && (
                      <div>
                        <p className="text-xs font-mono text-zinc-500 mb-1">DESCRIPTION</p>
                        <p className="text-sm text-zinc-400">{team.description}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'TOTAL', value: members.length, color: 'text-zinc-100' },
                { label: 'ADMINS', value: members.filter(m => m.role === 'admin' || m.role === 'leader').length, color: 'text-emerald-500' },
                { label: 'MEMBRES', value: members.filter(m => m.role === 'member').length, color: 'text-zinc-400' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3 text-center"
                >
                  <p className={`text-2xl font-mono font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Members List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-800/50">
                <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Membres de l&apos;équipe
                </h2>
              </div>

              <div className="divide-y divide-zinc-800/30">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="p-4 hover:bg-zinc-800/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        {member.profiles.avatar_url ? (
                          <Image
                            src={member.profiles.avatar_url}
                            alt=""
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-zinc-800 group-hover:ring-amber-500/30 transition-all"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center ring-2 ring-zinc-800 group-hover:ring-amber-500/30 transition-all">
                            <span className="text-sm font-mono font-medium text-zinc-300">
                              {getInitials(member)}
                            </span>
                          </div>
                        )}
                        {/* Online indicator for current user */}
                        {member.user_id === currentUser?.id && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-zinc-100 truncate">
                            {getMemberName(member)}
                          </p>
                          {getRoleBadge(member.role, currentUser?.isSuperAdmin || false, member.profiles.email)}
                          {member.user_id === currentUser?.id && (
                            <span className="text-xs text-zinc-600">(vous)</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 truncate font-mono">
                          {member.profiles.email}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {member.leave_balance}/{member.annual_leave_days} jours
                          </span>
                          <span>•</span>
                          <span>
                            Depuis {new Date(member.joined_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {currentUser?.isTeamAdmin && member.user_id !== currentUser?.id && member.role !== 'leader' && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {member.role === 'member' ? (
                            <button
                              onClick={() => handleMemberAction(member.id, 'promote')}
                              disabled={actionLoading === member.id}
                              className="p-2 rounded-lg hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 transition-colors"
                              title="Promouvoir admin"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMemberAction(member.id, 'demote')}
                              disabled={actionLoading === member.id || (currentUser?.role !== 'leader' && !currentUser?.isSuperAdmin)}
                              className="p-2 rounded-lg hover:bg-amber-500/10 text-zinc-400 hover:text-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Rétrograder membre"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Retirer ${getMemberName(member)} de l'équipe ?`)) {
                                handleMemberAction(member.id, 'remove');
                              }
                            }}
                            disabled={actionLoading === member.id}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Retirer de l'équipe"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Leader badge indicator */}
                      {member.role === 'leader' && (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {members.length === 0 && (
                <div className="p-12 text-center">
                  <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Aucun membre dans l&apos;équipe</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/30"
        >
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <span className="text-zinc-600 font-mono">LÉGENDE:</span>
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-500">Promouvoir admin</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-amber-500" />
              <span className="text-zinc-500">Rétrograder (créateur uniquement)</span>
            </div>
            <div className="flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-red-500" />
              <span className="text-zinc-500">Retirer de l&apos;équipe</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
