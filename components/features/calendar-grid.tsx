'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayStatus } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils/cn';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const STATUS_STYLES: Record<DayStatus, string> = {
  WORK: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
  REMOTE: 'bg-purple-100 border-purple-300 text-purple-700 font-bold',
  SCHOOL: 'bg-orange-100 border-orange-300 text-orange-700 font-bold',
  LEAVE: 'bg-pink-100 border-pink-300 text-pink-700 font-bold',
  HOLIDAY: 'bg-red-50 border-red-200 text-red-600 opacity-80',
  OFF: 'bg-slate-50 border-slate-100 text-slate-300 opacity-60',
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

  const handleMouseDown = useCallback((date: Date) => {
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
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 flex-1 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Navigation mois */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center bg-slate-100/80 rounded-xl border border-slate-200/50 p-1">
          <motion.button
            onClick={() => changeMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <span className="px-4 font-bold text-slate-700 min-w-[160px] text-center uppercase tracking-wide text-sm">
            {MONTH_NAMES[month]} {year}
          </span>
          <motion.button
            onClick={() => changeMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">
        {DAY_NAMES.map((day, i) => (
          <div key={day} className={i >= 5 ? 'text-indigo-400' : ''}>
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
            <motion.div
              key={formatDateKey(date)}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold border cursor-pointer select-none relative',
                STATUS_STYLES[status],
                isWeekend && 'pointer-events-none',
                isToday && 'ring-2 ring-indigo-500 ring-offset-2'
              )}
              onMouseDown={() => handleMouseDown(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              whileHover={!isWeekend ? { scale: 1.05, zIndex: 10 } : {}}
              whileTap={!isWeekend ? { scale: 0.95 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {date.getDate()}
              {isToday && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Astuce */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 bg-slate-50/80 inline-block px-3 py-1 rounded-full border border-slate-100">
          💡 Cliquez et glissez pour colorier plusieurs jours
        </p>
      </div>
    </div>
  );
}
