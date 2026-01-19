'use client';

import { Users, Crown, ChevronDown } from 'lucide-react';
import { useTeam } from '@/contexts/team-context';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export function TeamIndicator() {
  const { team, isLeader, loading } = useTeam();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-32 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-all"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          isLeader ? 'bg-amber-500/10' : 'bg-[var(--accent)]/10'
        }`}>
          {isLeader ? (
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
          )}
        </div>
        <span className="text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
          {team.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">{team.name}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {isLeader ? 'Chef d\'équipe' : 'Membre'}
            </p>
          </div>

          <div className="p-1">
            <Link
              href="/team/members"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <Users className="w-4 h-4" />
              Voir les membres
            </Link>
            {isLeader && (
              <Link
                href="/team/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <Crown className="w-4 h-4" />
                Paramètres équipe
              </Link>
            )}
          </div>

          <div className="p-3 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)]">
              Code: <span className="font-mono text-[var(--accent)]">{team.code}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
