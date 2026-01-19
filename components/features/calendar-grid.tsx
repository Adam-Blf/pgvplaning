'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayStatus } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils/cn';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Styles Service Public pour les statuts
const STATUS_STYLES: Record<DayStatus, string> = {
  WORK: 'bg-[var(--info-bg)] border-l-[3px] border-l-[var(--bleu-france)] text-[var(--bleu-france)]',
  REMOTE: 'bg-[var(--success-bg)] border-l-[3px] border-l-[var(--success)] text-[var(--success)]',
  SCHOOL: 'bg-[var(--warning-bg)] border-l-[3px] border-l-[var(--warning)] text-[var(--warning)]',
  LEAVE: 'bg-[var(--error-bg)] border-l-[3px] border-l-[var(--error)] text-[var(--error)]',
  HOLIDAY: 'bg-[var(--background-contrast)] border border-[var(--border-default)] text-[var(--text-mention)]',
  OFF: 'bg-[var(--background-contrast)] border border-[var(--border-default)] text-[var(--text-disabled)]',
};

interface CalendarGridProps {
  currentTool: DayStatus | 'ERASER';
  getDayStatus: (date: Date) => DayStatus;
  setDayStatus: (date: string, status: DayStatus | null) => void;
  formatDateKey: (date: Date) => string;
  onMonthChange?: (year: number, month: number) => void;
}

export function CalendarGrid({
  currentTool,
  getDayStatus,
  setDayStatus,
  formatDateKey,
  onMonthChange,
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
      setDayStatus(dateKey, null);
    } else {
      setDayStatus(dateKey, currentTool);
    }
  }, [currentTool, setDayStatus, formatDateKey]);

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
      className="flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[var(--border-default)]">
        <button
          onClick={() => changeMonth(-1)}
          className="fr-btn fr-btn--secondary py-2 px-3"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-bold text-[var(--text-title)] text-lg">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={goToToday}
            className="fr-btn fr-btn--tertiary text-sm py-1 px-2"
          >
            Aujourd'hui
          </button>
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="fr-btn fr-btn--secondary py-2 px-3"
          aria-label="Mois suivant"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 py-3 border-b border-[var(--border-default)]">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-bold uppercase',
              i >= 5 ? 'text-[var(--text-mention)]' : 'text-[var(--text-title)]'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-4">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getDayStatus(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={formatDateKey(date)}
              className={cn(
                'aspect-square rounded flex items-center justify-center text-sm font-medium select-none transition-all',
                STATUS_STYLES[status],
                isWeekend ? 'cursor-default opacity-60' : 'cursor-pointer hover:opacity-80 active:scale-95',
                isToday && 'ring-2 ring-[var(--bleu-france)] ring-offset-2 ring-offset-[var(--background-alt)]'
              )}
              onMouseDown={(e) => !isWeekend && handleMouseDown(date, e)}
              onMouseEnter={() => !isWeekend && handleMouseEnter(date)}
              role="button"
              tabIndex={isWeekend ? -1 : 0}
              aria-label={`${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`}
              aria-disabled={isWeekend}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
