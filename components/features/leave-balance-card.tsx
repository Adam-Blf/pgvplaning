'use client';

import { Calendar, Briefcase, GraduationCap, RefreshCw } from 'lucide-react';
import { useLeaveInfo } from '@/hooks/use-leave-info';
import { cn } from '@/lib/utils';

export function LeaveBalanceCard() {
  const { leaveInfo, loading, error, refetch } = useLeaveInfo();

  if (loading) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24" />
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !leaveInfo) {
    return null;
  }

  const percentage = (leaveInfo.leaveBalance / leaveInfo.annualLeaveDays) * 100;
  const isLow = percentage <= 20;
  const isMedium = percentage > 20 && percentage <= 50;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            leaveInfo.employeeType === 'executive'
              ? 'bg-purple-500/10'
              : 'bg-blue-500/10'
          )}>
            {leaveInfo.employeeType === 'executive' ? (
              <GraduationCap className="w-5 h-5 text-purple-500" />
            ) : (
              <Briefcase className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              Solde Congés
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                leaveInfo.employeeType === 'executive'
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'bg-blue-500/10 text-blue-500'
              )}>
                {leaveInfo.employeeTypeLabel}
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Année {leaveInfo.year}
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isLow ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
            )}
            style={{ width: `${Math.max(percentage, 3)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className={cn(
              'text-2xl font-bold',
              isLow ? 'text-red-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'
            )}>
              {leaveInfo.leaveBalance}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Disponibles</p>
          </div>

          <div className="w-px h-8 bg-[var(--border-subtle)]" />

          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-secondary)]">
              {leaveInfo.usedDays}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Utilisés</p>
          </div>

          <div className="w-px h-8 bg-[var(--border-subtle)]" />

          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-muted)]">
              {leaveInfo.annualLeaveDays}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Total/an</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">jours</span>
        </div>
      </div>

      {/* Warning if low */}
      {isLow && leaveInfo.leaveBalance > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-500 text-center">
            Attention : il vous reste peu de jours de congés
          </p>
        </div>
      )}

      {leaveInfo.leaveBalance === 0 && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-500 text-center">
            Vous avez utilisé tous vos jours de congés pour cette année
          </p>
        </div>
      )}
    </div>
  );
}
