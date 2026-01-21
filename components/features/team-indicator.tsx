'use client';

import { Users, Crown, ChevronDown } from 'lucide-react';
import { useTeam } from '@/contexts/team-context';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
      <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
    );
  }

  if (!team) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ease-out active:scale-95",
          showDropdown
            ? "bg-primary/10 border-primary/20"
            : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          isLeader ? "bg-amber-500/10" : "bg-primary/10"
        )}>
          {isLeader ? (
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Users className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
        <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
          {team.name}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-300",
          showDropdown ? "rotate-180 text-foreground" : ""
        )} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-popover border border-border/50 shadow-xl z-50 overflow-hidden animate-grade-in origin-top-right">
          <div className="p-4 border-b border-border/50 bg-muted/20">
            <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {isLeader ? (
                <>
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Chef d&apos;équipe</span>
                </>
              ) : (
                <>
                  <Users className="w-3 h-3" />
                  <span>Membre</span>
                </>
              )}
            </p>
          </div>

          <div className="p-1.5">
            <Link
              href="/team/members"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors group"
            >
              <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              Voir les membres
            </Link>
            {isLeader && (
              <Link
                href="/team/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors group"
              >
                <Crown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Paramètres équipe
              </Link>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border/50 bg-muted/10">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Code d&apos;invitation
            </p>
            <div className="mt-1 flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
              <span className="font-mono text-xs font-medium text-primary">{team.code}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
