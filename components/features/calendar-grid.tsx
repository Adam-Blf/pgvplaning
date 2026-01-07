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

const STATUS_STYLES: Record<DayStatus, string> = {
  WORK: 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700',
  REMOTE: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold',
  SCHOOL: 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold',
  LEAVE: 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold',
  HOLIDAY: 'bg-red-500/10 border-red-500/30 text-red-400 opacity-80',
  OFF: 'bg-slate-800/30 border-slate-700/30 text-slate-600 opacity-60',
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

  const applyTool = useCallback((date: Date) => {
    const dayOfWeek = date.getDay();
    // Ne pas modifier les week-ends
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

  // Générer les jours du mois
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Ajuster pour commencer par Lundi (JS: 0=Dim, 1=Lun)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const days: (Date | null)[] = [];

  // Jours vides avant le début du mois
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Jours du mois
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return (
    <div
      ref={containerRef}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 flex-1 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Navigation mois */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center bg-slate-700/50 rounded-xl border border-slate-600/50 p-1">
          <button
            onClick={() => changeMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 font-bold text-white min-w-[160px] text-center uppercase tracking-wide text-sm">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-600 text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700/50 pb-4">
        {DAY_NAMES.map((day, i) => (
          <div key={day} className={i >= 5 ? 'text-violet-400' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }

          const status = getDayStatus(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={formatDateKey(date)}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold border select-none relative transition-all duration-150',
                STATUS_STYLES[status],
                isWeekend ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95',
                isToday && 'ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900'
              )}
              onMouseDown={(e) => !isWeekend && handleMouseDown(date, e)}
              onMouseEnter={() => !isWeekend && handleMouseEnter(date)}
            >
              {date.getDate()}
              {isToday && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Astuce */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 bg-slate-700/30 inline-block px-3 py-1 rounded-full border border-slate-600/30">
          Cliquez et glissez pour colorier plusieurs jours
        </p>
      </div>
    </div>
  );
}
