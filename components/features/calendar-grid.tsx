'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumIcons } from '@/components/ui/premium-icons';
import { DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Status configuration with harmonized colors matching toolbar
const STATUS_CONFIG: Record<DayStatus, {
  base: string;
  glow: string;
  dot: string;
  ring: string;
}> = {
  WORK: {
    base: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    glow: 'shadow-[0_0_25px_-5px_rgba(99,102,241,0.4)]',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500/50',
  },
  REMOTE: {
    base: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    glow: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/50',
  },
  SCHOOL: {
    base: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    glow: 'shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/50',
  },
  TRAINER: {
    base: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    glow: 'shadow-[0_0_25px_-5px_rgba(139,92,246,0.4)]',
    dot: 'bg-violet-500',
    ring: 'ring-violet-500/50',
  },
  LEAVE: {
    base: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    glow: 'shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)]',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/50',
  },
  HOLIDAY: {
    base: 'bg-red-500/5 text-red-400/60 border-red-500/10',
    glow: '',
    dot: 'bg-red-500/40',
    ring: 'ring-red-500/20',
  },
  OFF: {
    base: 'bg-transparent text-[var(--text-tertiary)]',
    glow: '',
    dot: 'bg-white/10',
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
  const containerRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // WAAPI: animate month label on change
  const changeMonth = useCallback((delta: number) => {
    const el = monthRef.current;
    if (el) {
      el.animate([
        { transform: 'translateX(0)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translateX(${delta > 0 ? '-20px' : '20px'})`, opacity: 0, filter: 'blur(6px)' },
      ], { duration: 120, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
        onMonthChange?.(newDate.getFullYear(), newDate.getMonth());

        el.animate([
          { transform: `translateX(${delta > 0 ? '20px' : '-20px'})`, opacity: 0, filter: 'blur(6px)' },
          { transform: 'translateX(0)', opacity: 1, filter: 'blur(0px)' },
        ], { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
      };
    } else {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setCurrentDate(newDate);
      onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
    }
  }, [currentDate, onMonthChange]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today.getFullYear(), today.getMonth());
  }, [onMonthChange]);

  // WAAPI: stagger cells on mount / month change
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cells = grid.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i] as HTMLElement;
      cell.animate([
        { opacity: 0, transform: 'scale(0.85) translateY(8px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' },
      ], {
        duration: 250,
        delay: i * 8,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both',
      });
    }
  }, [month, year]);

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
    if (isMouseDown) applyTool(date);
  }, [isMouseDown, applyTool]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  const getBirthdaysForDate = useCallback((date: Date): Birthday[] => {
    const dayOfMonth = date.getDate();
    const monthOfYear = date.getMonth() + 1;
    return birthdays.filter(b => b.birthDay === dayOfMonth && b.birthMonth === monthOfYear);
  }, [birthdays]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));

  return (
    <div
      ref={containerRef}
      className="p-6 md:p-8 rounded-3xl glass-elevated shadow-xl overflow-hidden"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => changeMonth(-1)}
          className="p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all duration-200 hover:scale-110 active:scale-90"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <div
            ref={monthRef}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          >
            <span className="font-bold text-[var(--text-primary)] text-xl md:text-2xl tracking-tight">
              {MONTH_NAMES[month]}
            </span>
            <span className="text-[var(--text-tertiary)] font-medium text-lg">
              {year}
            </span>
          </div>
          <button
            onClick={goToToday}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all duration-200 hover:scale-110 active:scale-90"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
        {DAY_NAMES.map((day, i) => {
          const isWeekend = i >= 5;
          return (
            <div
              key={day}
              className={cn(
                'relative text-center py-3 rounded-xl font-semibold text-xs uppercase tracking-widest',
                isWeekend
                  ? 'text-rose-400/60 bg-rose-500/5'
                  : 'text-[var(--text-secondary)] bg-[var(--bg-overlay)]/50'
              )}
            >
              {day}
              {!isWeekend && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div ref={gridRef} className="grid grid-cols-7 gap-2 md:gap-3">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isToday = new Date().toDateString() === date.toDateString();
          const isSplit = hasSplitDay(date);
          const dateBirthdays = getBirthdaysForDate(date);
          const hasBirthday = dateBirthdays.length > 0;

          const amStatus = getHalfDayStatus(date, 'AM');
          const pmStatus = getHalfDayStatus(date, 'PM');
          const fullStatus = getDayStatus(date);
          const statusConfig = fullStatus && fullStatus !== 'OFF' ? STATUS_CONFIG[fullStatus] : null;

          const cellBaseClasses = cn(
            'aspect-square relative flex items-center justify-center font-semibold text-sm rounded-2xl',
            'border backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-200'
          );

          if (isWeekend) {
            return (
              <div
                key={formatDateKey(date)}
                className={cn(cellBaseClasses, 'opacity-30 cursor-not-allowed grayscale bg-[var(--bg-overlay)]/30 border-transparent text-[var(--text-disabled)]')}
              >
                {date.getDate()}
              </div>
            );
          }

          if (isSplit) {
            const amConfig = amStatus ? STATUS_CONFIG[amStatus] : null;
            const pmConfig = pmStatus ? STATUS_CONFIG[pmStatus] : null;
            return (
              <div
                key={formatDateKey(date)}
                className={cn(
                  cellBaseClasses,
                  'overflow-hidden cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-[0.92]',
                  'bg-[var(--bg-surface)] border-[var(--border-default)]',
                  isToday && 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-[var(--bg-base)]'
                )}
                onMouseDown={(e) => handleMouseDown(date, e)}
                onMouseEnter={() => handleMouseEnter(date)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMouseDown(date, e as unknown as React.MouseEvent); } }}
                role="button"
                tabIndex={0}
                aria-label={`${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })} - Demi-journée`}
              >
                <div className="absolute inset-0 flex flex-col w-full h-full">
                  <div className={cn('flex-1 w-full transition-colors duration-200', amConfig ? amConfig.base : 'bg-transparent')} />
                  <div className="h-px w-full bg-[var(--border-subtle)]" />
                  <div className={cn('flex-1 w-full transition-colors duration-200', pmConfig ? pmConfig.base : 'bg-transparent')} />
                </div>
                <span className="relative z-10 font-bold text-[var(--text-primary)] drop-shadow-md">{date.getDate()}</span>
                {hasBirthday && <BirthdayIndicator names={dateBirthdays.map(b => b.name)} />}
              </div>
            );
          }

          return (
            <div
              key={formatDateKey(date)}
              className={cn(
                cellBaseClasses,
                'cursor-pointer group hover:scale-105 hover:-translate-y-1 active:scale-[0.92]',
                statusConfig
                  ? cn(statusConfig.base, 'hover:' + statusConfig.glow)
                  : 'bg-[var(--bg-overlay)]/50 text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]',
                isToday && cn(
                  'ring-2 ring-offset-2 ring-offset-[var(--bg-base)]',
                  statusConfig ? statusConfig.ring : 'ring-amber-500/50'
                )
              )}
              onMouseDown={(e) => handleMouseDown(date, e)}
              onMouseEnter={() => handleMouseEnter(date)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMouseDown(date, e as unknown as React.MouseEvent); } }}
              role="button"
              tabIndex={0}
              aria-label={`${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}${fullStatus && fullStatus !== 'OFF' ? ` - ${fullStatus}` : ''}`}
            >
              {isToday && !statusConfig && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent" />
              )}
              {statusConfig && (
                <div className={cn('absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-scale-in', statusConfig.dot)} />
              )}
              <span className={cn('relative z-10 font-semibold', isToday && 'font-bold')}>
                {date.getDate()}
              </span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              {hasBirthday && <BirthdayIndicator names={dateBirthdays.map(b => b.name)} />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          {(['WORK', 'REMOTE', 'SCHOOL', 'TRAINER', 'LEAVE'] as DayStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const labels: Record<string, string> = {
              WORK: 'Bureau', REMOTE: 'Télétravail', SCHOOL: 'Formation', TRAINER: 'Formateur', LEAVE: 'Congé',
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

function BirthdayIndicator({ names }: { names: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.animate([
      { transform: 'scale(0) rotate(-180deg)' },
      { transform: 'scale(1) rotate(0deg)' },
    ], { duration: 400, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' });
  }, []);

  return (
    <div ref={ref} className="absolute -top-1.5 -right-1.5 z-20" style={{ opacity: 0 }}>
      <div
        className="relative w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30"
        title={`Anniversaire: ${names.join(', ')}`}
      >
        <PremiumIcons.Cake className="w-3 h-3 text-white" aria-hidden="true" />
        <div className="absolute inset-0 rounded-full bg-pink-400 animate-ping-slow" />
        <div className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L14.5 9H22L16 14L18.5 21L12 17L5.5 21L8 14L2 9H9.5L12 2Z" /></svg>
        </div>
      </div>
    </div>
  );
}
