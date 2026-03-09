'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, User, Copy, Check, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTeam } from '@/contexts/team-context';

export default function TeamMembersPage() {
  const { team, members, isLeader, loading, refreshTeam } = useTeam();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshTeam();
  }, [refreshTeam]);

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
        <Link href="/team/setup" className="btn btn-primary mt-4">
          Rejoindre une équipe
        </Link>
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
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {team.name}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {members.length} membre{members.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {isLeader && (
          <Link href="/team/settings" className="btn btn-secondary">
            <Settings className="w-4 h-4" />
            Paramètres
          </Link>
        )}
      </div>

      {/* Team Code */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Code d&apos;invitation</p>
            <p className="text-xl font-mono font-bold text-[var(--accent)] tracking-wider">
              {team.code}
            </p>
          </div>
          <button
            onClick={copyCode}
            className="btn btn-secondary"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Partagez ce code pour inviter de nouveaux membres
        </p>
      </div>

      {/* Members List */}
      <div className="card">
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-semibold text-[var(--text-primary)]">Membres de l&apos;équipe</h2>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  member.role === 'leader'
                    ? 'bg-amber-500/10'
                    : 'bg-[var(--bg-secondary)]'
                }`}>
                  {member.role === 'leader' ? (
                    <Crown className="w-5 h-5 text-amber-500" />
                  ) : (
                    <User className="w-5 h-5 text-[var(--text-muted)]" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    {member.profile?.full_name ||
                      `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() ||
                      member.profile?.email ||
                      'Utilisateur'}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {member.profile?.email}
                  </p>
                </div>
              </div>

              <span className={`text-xs px-2 py-1 rounded-full ${
                member.role === 'leader'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              }`}>
                {member.role === 'leader' ? 'Chef d\'équipe' : 'Membre'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
