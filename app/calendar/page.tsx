'use client';

import { useState } from 'react';
import { CalendarGrid } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus } from '@/hooks/use-calendar-data';

type Tool = DayStatus | 'ERASER';

export default function CalendarPage() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const { getDayStatus, setDayStatus, formatDateKey } = useCalendarData();

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800/50">
        <PaintingToolbar currentTool={currentTool} onToolChange={setCurrentTool} />
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden">
        <CalendarGrid
          currentTool={currentTool}
          getDayStatus={getDayStatus}
          setDayStatus={setDayStatus}
          formatDateKey={formatDateKey}
        />
      </div>
    </div>
  );
}
