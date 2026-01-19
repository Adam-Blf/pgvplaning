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
  WORK: 'calendar-day-work',
  REMOTE: 'calendar-day-remote',
  SCHOOL: 'calendar-day-training',
  TRAINER: 'calendar-day-trainer',
  LEAVE: 'calendar-day-leave',
  HOLIDAY: 'calendar-day-holiday',
  OFF: 'calendar-day-off',
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
      className="card"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => changeMonth(-1)}
          className="btn btn-secondary"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--accent)]" />
            <span className="font-[var(--font-display)] font-bold text-[var(--text-primary)] text-xl tracking-tight">
              {MONTH_NAMES[month]} {year}
            </span>
          </div>
          <button
            onClick={goToToday}
            className="btn-ghost text-sm px-3 py-1"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="btn btn-secondary"
          aria-label="Mois suivant"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-center text-xs font-bold uppercase tracking-wider py-2',
              i >= 5 ? 'text-[var(--text-disabled)]' : 'text-[var(--text-muted)]'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
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

          if (isSplit && !isWeekend) {
            // Render split cell with AM/PM sections
            return (
              <div
                key={formatDateKey(date)}
                className={cn(
                  'calendar-day calendar-day-split relative',
                  isToday && 'today'
                )}
                onMouseDown={(e) => handleMouseDown(date, e)}
                onMouseEnter={() => handleMouseEnter(date)}
                role="button"
                tabIndex={0}
                aria-label={`${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()} - Matin: ${amStatus || 'Travail'}, Après-midi: ${pmStatus || 'Travail'}${hasBirthday ? ` - Anniversaire: ${dateBirthdays.map(b => b.name).join(', ')}` : ''}`}
              >
                <div className="calendar-day-split-container">
                  <div
                    className={cn(
                      'calendar-day-am',
                      amStatus && STATUS_CLASSES[amStatus]
                    )}
                    title={`Matin: ${amStatus || 'Travail'}`}
                  />
                  <div
                    className={cn(
                      'calendar-day-pm',
                      pmStatus && STATUS_CLASSES[pmStatus]
                    )}
                    title={`Après-midi: ${pmStatus || 'Travail'}`}
                  />
                </div>
                <span className="calendar-day-number">{date.getDate()}</span>
                {hasBirthday && (
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10"
                    title={`🎂 ${dateBirthdays.map(b => b.name).join(', ')}`}
                  >
                    <Cake className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={formatDateKey(date)}
              className={cn(
                'calendar-day relative',
                STATUS_CLASSES[fullStatus],
                isWeekend && 'weekend',
                isToday && 'today'
              )}
              onMouseDown={(e) => !isWeekend && handleMouseDown(date, e)}
              onMouseEnter={() => !isWeekend && handleMouseEnter(date)}
              role="button"
              tabIndex={isWeekend ? -1 : 0}
              aria-label={`${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}${hasBirthday ? ` - Anniversaire: ${dateBirthdays.map(b => b.name).join(', ')}` : ''}`}
              aria-disabled={isWeekend}
            >
              {date.getDate()}
              {hasBirthday && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-lg z-10"
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
