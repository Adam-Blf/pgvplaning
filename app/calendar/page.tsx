'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarGrid } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus } from '@/hooks/use-calendar-data';

type Tool = DayStatus | 'ERASER';

export default function CalendarPage() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const { getDayStatus, setDayStatus, formatDateKey } = useCalendarData();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <p className="text-slate-400 text-sm">
          Sélectionnez un outil puis cliquez sur les jours pour modifier leur statut
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <PaintingToolbar currentTool={currentTool} onToolChange={setCurrentTool} />
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 min-h-0"
      >
        <div className="h-full bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <CalendarGrid
            currentTool={currentTool}
            getDayStatus={getDayStatus}
            setDayStatus={setDayStatus}
            formatDateKey={formatDateKey}
          />
        </div>
      </motion.div>
    </div>
  );
}
