'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarGrid, Birthday } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { Calendar, Briefcase, Home, GraduationCap, Presentation, Palmtree, Cake, Sparkles } from 'lucide-react';

type Tool = DayStatus | 'ERASER';

const legendItems = [
  { icon: Briefcase, label: 'Bureau', colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-500' },
  { icon: Home, label: 'Teletravail', colorClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' },
  { icon: GraduationCap, label: 'Formation', colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-500' },
  { icon: Presentation, label: 'Reunion', colorClass: 'bg-violet-500/10 border-violet-500/30 text-violet-500' },
  { icon: Palmtree, label: 'Conges', colorClass: 'bg-rose-500/10 border-rose-500/30 text-rose-500' },
  { icon: Cake, label: 'Anniversaire', colorClass: 'bg-pink-500/10 border-pink-500/30 text-pink-500' },
];

export default function CalendarPage() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const [currentHalfDay, setCurrentHalfDay] = useState<HalfDay>('FULL');
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const { getDayStatus, getHalfDayStatus, hasSplitDay, setDayStatus, formatDateKey } = useCalendarData();

  // Fetch team birthdays
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await fetch('/api/teams/birthdays');
        if (response.ok) {
          const data = await response.json();
          setBirthdays(data.birthdays || []);
        }
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      }
    };
    fetchBirthdays();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Calendrier</h1>
            <p className="text-sm text-[var(--text-muted)]">Cliquez ou glissez pour marquer vos journees</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-medium text-amber-500">Mode peinture</span>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PaintingToolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          currentHalfDay={currentHalfDay}
          onHalfDayChange={setCurrentHalfDay}
        />
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <CalendarGrid
          currentTool={currentTool}
          currentHalfDay={currentHalfDay}
          getDayStatus={getDayStatus}
          getHalfDayStatus={getHalfDayStatus}
          hasSplitDay={hasSplitDay}
          setDayStatus={setDayStatus}
          formatDateKey={formatDateKey}
          birthdays={birthdays}
        />
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {legendItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${item.colorClass}`}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
