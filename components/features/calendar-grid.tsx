'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Cake } from 'lucide-react';
import { DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Status classes mapped to CSS classes
const STATUS_CLASSES: Record<DayStatus, string> = {
  WORK: 'bg-status-work/10 text-status-work border border-status-work/20 shadow-sm',
  REMOTE: 'bg-status-remote/10 text-status-remote border border-status-remote/20 shadow-sm',
  SCHOOL: 'bg-status-school/10 text-status-school border border-status-school/20 shadow-sm',
  TRAINER: 'bg-violet-500/10 text-violet-500 border border-violet-500/20 shadow-sm',
  LEAVE: 'bg-status-leave/10 text-status-leave border border-status-leave/20 shadow-sm opacity-80',
  HOLIDAY: 'bg-secondary/50 text-muted-foreground border border-white/5',
  OFF: 'bg-transparent text-muted-foreground',
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = useCallback((delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth());
  }, [currentDate, onMonthChange]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today.getFullYear(), today.getMonth());
  }, [onMonthChange]);

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
      className="p-6 md:p-8 rounded-3xl bg-card/50 border border-white/5 backdrop-blur-sm shadow-xl"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all duration-200"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 group cursor-default">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <span className="font-sans font-bold text-foreground text-xl md:text-2xl tracking-tighter capitalize">
              {MONTH_NAMES[month]} <span className="text-muted-foreground font-medium">{year}</span>
            </span>
          </div>
          <button
            onClick={goToToday}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all duration-200"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-center text-[10px] md:text-xs font-bold uppercase tracking-widest py-2',
              i >= 5 ? 'text-red-400/50' : 'text-muted-foreground/60'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-3">
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

          // Interaction & base styles
          const cellBaseClasses = "aspect-square relative flex items-center justify-center font-medium text-sm rounded-2xl transition-all duration-300 group";
          const hoverClasses = !isWeekend ? "hover:scale-105 hover:shadow-lg hover:z-10 cursor-pointer active:scale-90" : "opacity-30 cursor-default grayscale";

          if (isSplit && !isWeekend) {
            return (
              <div
                key={formatDateKey(date)}
                className={cn(
                  cellBaseClasses,
                  hoverClasses,
                  'overflow-hidden bg-card border border-white/5',
                  isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                onMouseDown={(e) => handleMouseDown(date, e)}
                onMouseEnter={() => handleMouseEnter(date)}
                role="button"
                tabIndex={0}
              >
                <div className="absolute inset-0 flex flex-col w-full h-full">
                  <div
                    className={cn(
                      'flex-1 w-full transition-colors',
                      amStatus ? STATUS_CLASSES[amStatus].replace('shadow-sm', '') + ' border-0' : 'bg-transparent'
                    )}
                  />
                  <div className="h-[1px] w-full bg-border/50" />
                  <div
                    className={cn(
                      'flex-1 w-full transition-colors',
                      pmStatus ? STATUS_CLASSES[pmStatus].replace('shadow-sm', '') + ' border-0' : 'bg-transparent'
                    )}
                  />
                </div>
                <span className="relative z-10 font-bold drop-shadow-md">{date.getDate()}</span>
                {hasBirthday && (
                  <span className="absolute top-1 right-1 text-[8px] transform rotate-12">🎂</span>
                )}
              </div>
            );
          }

          const statusClass = fullStatus && fullStatus !== 'OFF' ? STATUS_CLASSES[fullStatus] : 'bg-white/[0.02] text-foreground hover:bg-white/[0.04] border border-white/5';

          return (
            <div
              key={formatDateKey(date)}
              className={cn(
                cellBaseClasses,
                hoverClasses,
                statusClass,
                isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow-primary',
                // Subtle pulse if today and no status
                (isToday && !fullStatus) && 'animate-pulse-slow'
              )}
              onMouseDown={(e) => !isWeekend && handleMouseDown(date, e)}
              onMouseEnter={() => !isWeekend && handleMouseEnter(date)}
              role="button"
              tabIndex={isWeekend ? -1 : 0}
            >
              {date.getDate()}
              {hasBirthday && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10 animate-bounce-slow"
                  title={`🎂 ${dateBirthdays.map(b => b.name).join(', ')}`}
                >
                  <Cake className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
