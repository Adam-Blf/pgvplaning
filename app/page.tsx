'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { CalendarGrid } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus } from '@/hooks/use-calendar-data';
import { Spotlight } from '@/components/ui/spotlight';

type Tool = DayStatus | 'ERASER';

export default function Home() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const { getDayStatus, setDayStatus, formatDateKey } = useCalendarData();

  return (
    <AppLayout>
      <div className="h-full flex flex-col max-w-6xl mx-auto relative">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20 opacity-50"
          fill="rgba(99, 102, 241, 0.4)"
        />

        {/* Header - Liquid Glass */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 relative z-10"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Liquid Glass Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.6)] flex items-center justify-center">
                <Calendar className="w-7 h-7 text-indigo-600" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Planning Global
              </h1>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.header>

        {/* Toolbar - Liquid Glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <div className="bg-white/30 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] overflow-hidden">
            <PaintingToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
            />
          </div>
        </motion.div>

        {/* Calendar Grid - Liquid Glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 mt-4 relative z-10"
        >
          <div className="h-full bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] overflow-hidden">
            <CalendarGrid
              currentTool={currentTool}
              getDayStatus={getDayStatus}
              setDayStatus={setDayStatus}
              formatDateKey={formatDateKey}
            />
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
