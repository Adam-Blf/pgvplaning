'use client';

import { Calendar, Briefcase, GraduationCap, RefreshCw } from 'lucide-react';
import { useLeaveInfo } from '@/hooks/use-leave-info';
import { cn } from '@/lib/utils';

export function LeaveBalanceCard() {
  const { leaveInfo, loading, error, refetch } = useLeaveInfo();

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-card p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-32" />
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

  // Determine colors based on status
  const getColorClasses = () => {
    if (isLow) return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/20', bgSubtle: 'bg-red-500/10' };
    if (isMedium) return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/20', bgSubtle: 'bg-amber-500/10' };
    return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/20', bgSubtle: 'bg-emerald-500/10' };
  };

  const statusColors = getColorClasses();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-white/10">

      {/* Background Glow Effect */}
      <div className={cn(
        "absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[50px] opacity-0 transition-opacity duration-500 group-hover:opacity-10",
        leaveInfo.employeeType === 'executive' ? "bg-purple-500" : "bg-blue-500"
      )} />

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner',
            leaveInfo.employeeType === 'executive'
              ? 'bg-purple-500/10'
              : 'bg-blue-500/10'
          )}>
            {leaveInfo.employeeType === 'executive' ? (
              <GraduationCap className="w-6 h-6 text-purple-500" />
            ) : (
              <Briefcase className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-3">
              Solde Congés
              <span className={cn(
                'text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md',
                leaveInfo.employeeType === 'executive'
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'bg-blue-500/10 text-blue-500'
              )}>
                {leaveInfo.employeeTypeLabel}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Année {leaveInfo.year}
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 active:rotate-180 duration-500"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6 relative">
        <div className="h-4 bg-muted rounded-full overflow-hidden border border-white/5">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden',
              statusColors.bg
            )}
            style={{ width: `${Math.max(percentage, 3)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between bg-muted/20 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={cn('text-2xl font-bold tracking-tight', statusColors.text)}>
              {leaveInfo.leaveBalance}
            </p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dispo</p>
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {leaveInfo.usedDays}
            </p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Utilisés</p>
          </div>

          <div className="w-px h-8 bg-border/50" />

          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {leaveInfo.annualLeaveDays}
            </p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground bg-background/50 px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-medium">Jours</span>
        </div>
      </div>

      {/* Warnings */}
      {(isLow && leaveInfo.leaveBalance > 0) && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse-slow">
          <p className="text-sm font-medium text-red-500">
            ⚠️ Attention : solde faible
          </p>
        </div>
      )}

      {leaveInfo.leaveBalance === 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <p className="text-sm font-medium text-red-500">
            Solde épuisé pour cette année
          </p>
        </div>
      )}
    </div>
  );
}
