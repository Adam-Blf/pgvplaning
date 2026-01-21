'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Briefcase,
  GraduationCap,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLeaveInfo } from '@/hooks/use-leave-info';
import { cn } from '@/lib/utils';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] // ease-out-expo
    }
  }
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.1,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

const progressVariants = {
  hidden: { width: 0 },
  visible: (percentage: number) => ({
    width: `${Math.max(percentage, 3)}%`,
    transition: {
      delay: 0.3,
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

// Skeleton loader component
function LeaveBalanceSkeleton() {
  return (
    <div className="card glass-elevated p-6 overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl skeleton" />
          <div className="space-y-2">
            <div className="h-5 w-32 skeleton rounded-lg" />
            <div className="h-4 w-24 skeleton rounded-lg" />
          </div>
        </div>
        <div className="w-10 h-10 skeleton rounded-xl" />
      </div>

      <div className="mb-6">
        <div className="h-3 skeleton rounded-full" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-8 w-12 skeleton rounded-lg mx-auto" />
              <div className="h-3 w-16 skeleton rounded" />
            </div>
          ))}
        </div>
        <div className="h-8 w-20 skeleton rounded-lg" />
      </div>
    </div>
  );
}

export function LeaveBalanceCard() {
  const { leaveInfo, loading, error, refetch } = useLeaveInfo();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (leaveInfo && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [leaveInfo, hasAnimated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (loading) {
    return <LeaveBalanceSkeleton />;
  }

  if (error || !leaveInfo) {
    return null;
  }

  const percentage = (leaveInfo.leaveBalance / leaveInfo.annualLeaveDays) * 100;
  const isLow = percentage <= 20;
  const isMedium = percentage > 20 && percentage <= 50;
  const isHigh = percentage > 50;
  const isExecutive = leaveInfo.employeeType === 'executive';

  // Status configuration
  const getStatusConfig = () => {
    if (isLow) return {
      color: 'rose',
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      bgSubtle: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]',
      icon: TrendingDown,
      label: 'Faible'
    };
    if (isMedium) return {
      color: 'amber',
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      bgSubtle: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]',
      icon: Minus,
      label: 'Modere'
    };
    return {
      color: 'emerald',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      bgSubtle: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]',
      icon: TrendingUp,
      label: 'Bon'
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  // Type configuration
  const typeConfig = isExecutive
    ? {
        icon: GraduationCap,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'bg-purple-500'
      }
    : {
        icon: Briefcase,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        glow: 'bg-indigo-500'
      };

  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative overflow-hidden"
    >
      {/* Main Card */}
      <div className="card glass-elevated p-6 relative">
        {/* Background Glow Effects */}
        <div className={cn(
          "absolute -right-24 -top-24 w-48 h-48 rounded-full blur-[80px] opacity-0 transition-opacity duration-700 group-hover:opacity-20",
          typeConfig.glow
        )} />
        <div className={cn(
          "absolute -left-16 -bottom-16 w-32 h-32 rounded-full blur-[60px] opacity-0 transition-opacity duration-700 group-hover:opacity-15",
          status.bg
        )} />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Icon with ambient glow */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300',
                typeConfig.bg,
                typeConfig.border,
                'group-hover:shadow-lg'
              )}
            >
              <TypeIcon className={cn('w-7 h-7', typeConfig.color)} />
            </motion.div>

            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-lg flex items-center gap-3">
                Solde Conges
                <span className={cn(
                  'text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border transition-all',
                  typeConfig.bg,
                  typeConfig.color,
                  typeConfig.border
                )}>
                  {leaveInfo.employeeTypeLabel}
                </span>
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Annee {leaveInfo.year}
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-300',
              'bg-[var(--bg-overlay)] border border-[var(--border-subtle)]',
              'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
              'hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)]',
              isRefreshing && 'pointer-events-none'
            )}
            title="Actualiser"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.6, ease: 'linear', repeat: isRefreshing ? Infinity : 0 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Progress Section */}
        <div className="mb-6 relative">
          {/* Progress Labels */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Progression
            </span>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('w-3.5 h-3.5', status.text)} />
              <span className={cn('text-sm font-semibold', status.text)}>
                {Math.round(percentage)}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <motion.div
              variants={progressVariants}
              initial="hidden"
              animate="visible"
              custom={percentage}
              className={cn(
                'h-full rounded-full relative overflow-hidden',
                status.bg
              )}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
          </div>

          {/* Progress markers */}
          <div className="flex justify-between mt-1.5 px-0.5">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div key={mark} className="flex flex-col items-center">
                <div className={cn(
                  'w-0.5 h-1.5 rounded-full',
                  percentage >= mark ? status.bg : 'bg-[var(--border-default)]'
                )} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="glass rounded-2xl p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              {/* Available */}
              <motion.div
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="text-center"
              >
                <div className={cn(
                  'text-3xl font-bold tracking-tight mb-1',
                  status.text
                )}>
                  {leaveInfo.leaveBalance}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className={cn('w-3 h-3', status.text)} />
                  <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Dispo
                  </span>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="divider-vertical h-12 opacity-50" />

              {/* Used */}
              <motion.div
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="text-center"
              >
                <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
                  {leaveInfo.usedDays}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Utilises
                  </span>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="divider-vertical h-12 opacity-50" />

              {/* Total */}
              <motion.div
                variants={statVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="text-center"
              >
                <div className="text-3xl font-bold tracking-tight text-[var(--text-muted)] mb-1">
                  {leaveInfo.annualLeaveDays}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Badge */}
            <motion.div
              variants={statVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              className={cn(
                'hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border',
                status.bgSubtle,
                status.border
              )}
            >
              <div className={cn('w-2 h-2 rounded-full', status.bg)} />
              <span className={cn('text-xs font-semibold', status.text)}>
                {status.label}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Warning Messages */}
        <AnimatePresence mode="wait">
          {isLow && leaveInfo.leaveBalance > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4"
            >
              <div className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl border',
                'bg-rose-500/10 border-rose-500/20',
                'animate-pulse'
              )}>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <p className="text-sm font-medium text-rose-400">
                  Attention : solde faible
                </p>
              </div>
            </motion.div>
          )}

          {leaveInfo.leaveBalance === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4"
            >
              <div className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl border',
                'bg-rose-500/10 border-rose-500/20'
              )}>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <p className="text-sm font-medium text-rose-400">
                  Solde epuise pour cette annee
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
