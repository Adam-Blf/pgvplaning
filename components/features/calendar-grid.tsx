'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Cake, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Status configuration with vibrant colors and glow effects
const STATUS_CONFIG: Record<DayStatus, {
  base: string;
  glow: string;
  dot: string;
  ring: string;
}> = {
  WORK: {
    base: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    glow: 'shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)]',
    dot: 'bg-indigo-400',
    ring: 'ring-indigo-500/50',
  },
  REMOTE: {
    base: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glow: 'shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)]',
    dot: 'bg-emerald-400',
    ring: 'ring-emerald-500/50',
  },
  SCHOOL: {
    base: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    glow: 'shadow-[0_0_20px_-4px_rgba(245,158,11,0.5)]',
    dot: 'bg-amber-400',
    ring: 'ring-amber-500/50',
  },
  TRAINER: {
    base: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    glow: 'shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]',
    dot: 'bg-violet-400',
    ring: 'ring-violet-500/50',
  },
  LEAVE: {
    base: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    glow: 'shadow-[0_0_20px_-4px_rgba(244,63,94,0.4)]',
    dot: 'bg-rose-400',
    ring: 'ring-rose-500/50',
  },
  HOLIDAY: {
    base: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    glow: '',
    dot: 'bg-slate-400',
    ring: 'ring-slate-500/30',
  },
  OFF: {
    base: 'bg-transparent text-[var(--text-tertiary)]',
    glow: '',
    dot: 'bg-slate-600',
    ring: '',
  },
};

export interface Birthday {
  userId: string;
  name: string;
  birthMonth: number;
  birthDay: number;
}

interface CalendarGridProps {
  currentTool: DayStatus | 'ERASER';
  currentHalfDay: HalfDay;
  getDayStatus: (date: Date, halfDay?: HalfDay) => DayStatus;
  getHalfDayStatus: (date: Date, halfDay: 'AM' | 'PM') => DayStatus | null;
  hasSplitDay: (date: Date) => boolean;
  setDayStatus: (date: string, status: DayStatus | null, halfDay?: HalfDay) => void;
  formatDateKey: (date: Date) => string;
  onMonthChange?: (year: number, month: number) => void;
  birthdays?: Birthday[];
}

// Animation variants
const cellVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  hover: { scale: 1.08, y: -2 },
  tap: { scale: 0.95 },
};

const monthVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export function CalendarGrid({
  currentTool,
  currentHalfDay,
  getDayStatus,
  getHalfDayStatus,
  hasSplitDay,
  setDayStatus,
  formatDateKey,
  onMonthChange,
  birthdays = [],
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = useCallback((delta: number) => {
    setDirection(delta);
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  }, [currentDate, onMonthChange]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setDirection(today > currentDate ? 1 : -1);
    setCurrentDate(today);
    onMonthChange?.(today.getFullYear(), today.getMonth());
  }, [currentDate, onMonthChange]);

  const applyTool = useCallback((date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return;

    const dateKey = formatDateKey(date);

    if (currentTool === 'ERASER') {
      setDayStatus(dateKey, null, currentHalfDay);
    } else {
      setDayStatus(dateKey, currentTool, currentHalfDay);
    }
  }, [currentTool, currentHalfDay, setDayStatus, formatDateKey]);

  const handleMouseDown = useCallback((date: Date, e: React.MouseEvent) => {
    e.preventDefault();
    setIsMouseDown(true);
    applyTool(date);
  }, [applyTool]);

  const handleMouseEnter = useCallback((date: Date) => {
    if (isMouseDown) {
      applyTool(date);
    }
  }, [isMouseDown, applyTool]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // Helper to check if a date has a birthday
  const getBirthdaysForDate = useCallback((date: Date): Birthday[] => {
    const dayOfMonth = date.getDate();
    const monthOfYear = date.getMonth() + 1; // 1-indexed
    return birthdays.filter(b => b.birthDay === dayOfMonth && b.birthMonth === monthOfYear);
  }, [birthdays]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const days: (Date | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return (
    <div
      ref={containerRef}
      className="p-6 md:p-8 rounded-3xl glass-elevated shadow-xl overflow-hidden"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--border-subtle)]">
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeMonth(-1)}
          className="p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all duration-300"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${month}-${year}`}
              custom={direction}
              variants={monthVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            >
              <span className="font-bold text-[var(--text-primary)] text-xl md:text-2xl tracking-tight">
                {MONTH_NAMES[month]}
              </span>
              <span className="text-[var(--text-tertiary)] font-medium text-lg">
                {year}
              </span>
            </motion.div>
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all duration-300"
          >
            Aujourd&apos;hui
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeMonth(1)}
          className="p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all duration-300"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Days Header - Stylized */}
      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
        {DAY_NAMES.map((day, i) => {
          const isWeekend = i >= 5;
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'relative text-center py-3 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all duration-300',
                isWeekend
                  ? 'text-rose-400/60 bg-rose-500/5'
                  : 'text-[var(--text-secondary)] bg-[var(--bg-overlay)]/50'
              )}
            >
              {day}
              {!isWeekend && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <motion.div
        className="grid grid-cols-7 gap-2 md:gap-3"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: { staggerChildren: 0.01 },
          },
        }}
      >
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isToday = new Date().toDateString() === date.toDateString();
          const isSplit = hasSplitDay(date);
          const dateBirthdays = getBirthdaysForDate(date);
          const hasBirthday = dateBirthdays.length > 0;

          // For split days, get individual half-day statuses
          const amStatus = getHalfDayStatus(date, 'AM');
          const pmStatus = getHalfDayStatus(date, 'PM');
          const fullStatus = getDayStatus(date);

          const statusConfig = fullStatus && fullStatus !== 'OFF'
            ? STATUS_CONFIG[fullStatus]
            : null;

          // Base cell classes
          const cellBaseClasses = cn(
            'aspect-square relative flex items-center justify-center font-semibold text-sm rounded-2xl transition-all duration-300',
            'border backdrop-blur-sm'
          );

          // Weekend styling
          if (isWeekend) {
            return (
              <motion.div
                key={formatDateKey(date)}
                variants={cellVariants}
                className={cn(
                  cellBaseClasses,
                  'opacity-30 cursor-not-allowed grayscale',
                  'bg-[var(--bg-overlay)]/30 border-transparent text-[var(--text-disabled)]'
                )}
              >
                {date.getDate()}
              </motion.div>
            );
          }

          // Split day rendering
          if (isSplit) {
            const amConfig = amStatus ? STATUS_CONFIG[amStatus] : null;
            const pmConfig = pmStatus ? STATUS_CONFIG[pmStatus] : null;

            return (
              <motion.div
                key={formatDateKey(date)}
                variants={cellVariants}
                whileHover="hover"
                whileTap="tap"
                className={cn(
                  cellBaseClasses,
                  'overflow-hidden cursor-pointer',
                  'bg-[var(--bg-surface)] border-[var(--border-default)]',
                  isToday && 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-[var(--bg-base)]'
                )}
                onMouseDown={(e) => handleMouseDown(date, e)}
                onMouseEnter={() => handleMouseEnter(date)}
                role="button"
                tabIndex={0}
              >
                {/* Split day background */}
                <div className="absolute inset-0 flex flex-col w-full h-full">
                  <div
                    className={cn(
                      'flex-1 w-full transition-all duration-300',
                      amConfig ? amConfig.base : 'bg-transparent'
                    )}
                  />
                  <div className="h-px w-full bg-[var(--border-subtle)]" />
                  <div
                    className={cn(
                      'flex-1 w-full transition-all duration-300',
                      pmConfig ? pmConfig.base : 'bg-transparent'
                    )}
                  />
                </div>
                <span className="relative z-10 font-bold text-[var(--text-primary)] drop-shadow-md">
                  {date.getDate()}
                </span>
                {hasBirthday && <BirthdayIndicator names={dateBirthdays.map(b => b.name)} />}
              </motion.div>
            );
          }

          // Normal day rendering
          return (
            <motion.div
              key={formatDateKey(date)}
              variants={cellVariants}
              whileHover="hover"
              whileTap="tap"
              className={cn(
                cellBaseClasses,
                'cursor-pointer group',
                statusConfig
                  ? cn(statusConfig.base, 'hover:' + statusConfig.glow)
                  : 'bg-[var(--bg-overlay)]/50 text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]',
                isToday && cn(
                  'ring-2 ring-offset-2 ring-offset-[var(--bg-base)]',
                  statusConfig ? statusConfig.ring : 'ring-amber-500/50',
                  !statusConfig && 'animate-pulse-glow'
                )
              )}
              onMouseDown={(e) => handleMouseDown(date, e)}
              onMouseEnter={() => handleMouseEnter(date)}
              role="button"
              tabIndex={0}
            >
              {/* Today indicator glow */}
              {isToday && !statusConfig && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent" />
              )}

              {/* Status indicator dot */}
              {statusConfig && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    'absolute top-1.5 right-1.5 w-2 h-2 rounded-full',
                    statusConfig.dot
                  )}
                />
              )}

              <span className={cn(
                'relative z-10 font-semibold transition-all duration-300',
                isToday && 'font-bold'
              )}>
                {date.getDate()}
              </span>

              {/* Hover shine effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              {hasBirthday && <BirthdayIndicator names={dateBirthdays.map(b => b.name)} />}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          {(['WORK', 'REMOTE', 'SCHOOL', 'TRAINER', 'LEAVE'] as DayStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const labels: Record<string, string> = {
              WORK: 'Bureau',
              REMOTE: 'Remote',
              SCHOOL: 'Formation',
              TRAINER: 'Formateur',
              LEAVE: 'Congé',
            };
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', config.dot)} />
                <span className="text-[var(--text-tertiary)]">{labels[status]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Birthday indicator component with animation
function BirthdayIndicator({ names }: { names: string[] }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="absolute -top-1.5 -right-1.5 z-20"
    >
      <div
        className="relative w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30"
        title={`Anniversaire: ${names.join(', ')}`}
      >
        <Cake className="w-3 h-3 text-white" />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-pink-400"
        />
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
      </div>
    </motion.div>
  );
}
