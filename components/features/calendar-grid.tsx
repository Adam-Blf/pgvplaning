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
  WORK: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600',
  REMOTE: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  SCHOOL: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  LEAVE: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
  HOLIDAY: 'bg-red-500/10 border-red-500/20 text-red-400/70',
  OFF: 'bg-slate-900/50 border-slate-800/50 text-slate-600',
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
      className="h-full flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-center py-4 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 font-semibold text-white min-w-[140px] text-center text-sm">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 px-4 py-3 border-b border-slate-800/50">
        {DAY_NAMES.map((day, i) => (
          <div
            key={day}
            className={cn(
              'text-center text-[10px] font-semibold uppercase tracking-wider',
              i >= 5 ? 'text-indigo-400' : 'text-slate-500'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-1 p-4 content-start">
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
                'aspect-square rounded-lg flex items-center justify-center text-xs font-medium border select-none transition-all duration-100',
                STATUS_STYLES[status],
                isWeekend ? 'cursor-default opacity-50' : 'cursor-pointer active:scale-95',
                isToday && 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950'
              )}
              onMouseDown={(e) => !isWeekend && handleMouseDown(date, e)}
              onMouseEnter={() => !isWeekend && handleMouseEnter(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
