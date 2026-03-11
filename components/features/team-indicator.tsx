'use client';

import { Users, Crown, ChevronDown, Link2, Copy, Check, Loader2, Settings, UserPlus, LogOut } from 'lucide-react';
import { useTeam } from '@/contexts/team-context';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { authFetch } from '@/lib/auth-fetch';
import { Link, useRouter } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TeamIndicator() {
  const { team, isLeader, loading } = useTeam();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generer un lien d'invitation
  const generateInviteLink = async () => {
    if (!isLeader) return;

    setIsGenerating(true);
    try {
      const response = await authFetch('/api/teams/invitations', {
        method: 'POST',
        body: JSON.stringify({ expiresIn: '7d' }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la création du lien');
        return;
      }

      setInviteUrl(data.invitation.url);
      toast.success('Lien d\'invitation créé !');
    } catch (error) {
      console.error('Error generating invite:', error);
      toast.error('Erreur lors de la création du lien');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copier le lien ou le code
  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(type === 'link' ? 'Lien copié !' : 'Code copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-10 w-36 rounded-xl skeleton" />
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-haspopup="true"
        aria-label={`Menu équipe ${team.name}`}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl",
          "border backdrop-blur-sm hover:scale-105 active:scale-95 transition-[transform,border-color,background-color,box-shadow] duration-200",
          showDropdown
            ? "glass-elevated border-[var(--gold-500)]/30 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"
            : "glass border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-overlay)]"
        )}
      >
        {/* Avatar */}
        <div className={cn(
          "relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
          isLeader
            ? "bg-gradient-to-br from-[var(--gold-500)]/20 to-[var(--gold-600)]/10 border border-[var(--gold-500)]/30"
            : "bg-[var(--bg-overlay)] border border-[var(--border-default)]"
        )}>
          {isLeader ? (
            <Crown className="w-3.5 h-3.5 text-[var(--gold-500)]" />
          ) : (
            <Users className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          )}
          {/* Status dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[var(--bg-base)]" />
        </div>

        {/* Team name */}
        <span className="text-sm font-medium text-[var(--text-primary)] max-w-[100px] truncate">
          {team.name}
        </span>

        {/* Chevron with rotation */}
        <div
          className={cn(
            "transition-transform duration-300",
            showDropdown ? "rotate-180" : "rotate-0"
          )}
        >
          <ChevronDown className={cn(
            "w-4 h-4 transition-colors duration-200",
            showDropdown ? "text-[var(--gold-500)]" : "text-[var(--text-tertiary)]"
          )} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-elevated border border-[var(--border-default)] shadow-xl z-50 overflow-hidden animate-fade-in"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-overlay)] to-transparent">
              <div className="flex items-center gap-3">
                {/* Team Avatar */}
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center",
                  isLeader
                    ? "bg-[var(--gold-500)]/10 border border-[var(--gold-500)]/30"
                    : "bg-[var(--bg-surface)] border border-[var(--border-default)]"
                )}>
                  <Users className={cn(
                    "w-5 h-5",
                    isLeader ? "text-[var(--gold-500)]" : "text-[var(--text-secondary)]"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {team.name}
                  </p>
                  {/* Role Badge */}
                  <div className="mt-1">
                    {isLeader ? (
                      <span className="badge border-[var(--gold-500)]/30 text-[var(--gold-500)] bg-[var(--gold-500)]/10">
                        <Crown className="w-3 h-3" />
                        Chef d&apos;equipe
                      </span>
                    ) : (
                      <span className="badge">
                        <Users className="w-3 h-3" />
                        Membre
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 stagger-children">
              <Link
                role="menuitem"
                href="/team/members"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--border-default)] transition-colors">
                  <Users className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-amber-500 transition-colors" />
                </div>
                <span>Voir les membres</span>
              </Link>

              {isLeader && (
                <Link
                  role="menuitem"
                  href="/team/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--border-default)] transition-colors">
                    <Settings className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-amber-500 transition-colors" />
                  </div>
                  <span>Parametres equipe</span>
                </Link>
              )}
            </div>

            {/* Divider */}
            <div className="divider mx-4" />

            {/* Invitation Section */}            <div className="p-4 space-y-3">
              {/* Code d'invitation */}
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-2">
                  Code d&apos;invitation
                </p>
                <button
                  type="button"
                  aria-label="Copier le code"
                  onClick={() => copyToClipboard(team.code, 'code')}
                  className="w-full flex items-center justify-between p-3 rounded-xl glass border border-[var(--border-subtle)] hover:border-amber-500/30 hover:scale-105 active:scale-95 transition-[transform,border-color,background-color,box-shadow] duration-200 group"
                >
                  <span className="font-mono text-sm font-semibold gradient-text-amber">
                    {team.code}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500 animate-scale-in" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-amber-500 transition-colors" />
                    )}
                  </div>
                </button>
              </div>

              {/* Lien d'invitation (leaders seulement) */}
              {isLeader && (
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-2">
                    Lien d&apos;invitation
                  </p>
                  {inviteUrl ? (
                    <button
                      type="button"
                      aria-label="Copier le lien"
                      onClick={() => copyToClipboard(inviteUrl, 'link')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl gradient-amber-soft border border-amber-500/20 hover:border-amber-500/40 hover:scale-105 active:scale-95 transition-[transform,border-color,background-color,box-shadow] duration-200 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Link2 className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="text-xs text-amber-400 truncate flex-1 text-left font-medium">
                        {inviteUrl.replace(/^https?:\/\//, '').slice(0, 28)}...
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500 animate-scale-in" />
                        ) : (
                          <Copy className="w-4 h-4 text-amber-500/70 group-hover:text-amber-500" />
                        )}
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={generateInviteLink}
                      disabled={isGenerating}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 p-3 rounded-xl",
                        "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium text-sm",
                        "shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30",
                        "hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-[transform,border-color,background-color,box-shadow] duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generation...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Generer un lien
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
                    Valide pendant 7 jours
                  </p>
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="divider mx-4" />
            <div className="p-2">
              <button
                type="button"
                onClick={async () => {
                  setShowDropdown(false);
                  if (auth) await signOut(auth);
                  router.push('/login');
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group w-full"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:border-red-500/30 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
