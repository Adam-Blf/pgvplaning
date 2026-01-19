'use client';

import { useState } from 'react';
import { CalendarGrid } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { Info, Briefcase, Home, GraduationCap, Presentation, Palmtree, Calendar } from 'lucide-react';

type Tool = DayStatus | 'ERASER';

export default function CalendarPage() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const [currentHalfDay, setCurrentHalfDay] = useState<HalfDay>('FULL');
  const { getDayStatus, getHalfDayStatus, hasSplitDay, setDayStatus, formatDateKey } = useCalendarData();

  return (
    <div className="space-y-6 stagger-children">
      {/* Instructions */}
      <div className="notice notice-info">
        <div className="w-10 h-10 rounded-lg bg-[var(--info-bg)] flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-[var(--info)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            Mode de saisie
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Sélectionnez un type de journée ci-dessous, puis cliquez ou glissez sur les jours du calendrier
            pour les marquer. Les week-ends ne sont pas sélectionnables. Utilisez la gomme pour effacer.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <PaintingToolbar
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        currentHalfDay={currentHalfDay}
        onHalfDayChange={setCurrentHalfDay}
      />

      {/* Calendar */}
      <CalendarGrid
        currentTool={currentTool}
        currentHalfDay={currentHalfDay}
        getDayStatus={getDayStatus}
        getHalfDayStatus={getHalfDayStatus}
        hasSplitDay={hasSplitDay}
        setDayStatus={setDayStatus}
        formatDateKey={formatDateKey}
      />

      {/* Légende */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-bold text-[var(--text-primary)]">Légende</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-work-bg)] border border-[var(--status-work)]">
            <Briefcase className="w-4 h-4 text-[var(--status-work)]" />
            <span className="text-sm font-medium text-[var(--status-work)]">Bureau</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-remote-bg)] border border-[var(--status-remote)]">
            <Home className="w-4 h-4 text-[var(--status-remote)]" />
            <span className="text-sm font-medium text-[var(--status-remote)]">Télétravail</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-training-bg)] border border-[var(--status-training)]">
            <GraduationCap className="w-4 h-4 text-[var(--status-training)]" />
            <span className="text-sm font-medium text-[var(--status-training)]">Formation reçue</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-trainer-bg)] border border-[var(--status-trainer)]">
            <Presentation className="w-4 h-4 text-[var(--status-trainer)]" />
            <span className="text-sm font-medium text-[var(--status-trainer)]">Formateur/Réunion</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-leave-bg)] border border-[var(--status-leave)]">
            <Palmtree className="w-4 h-4 text-[var(--status-leave)]" />
            <span className="text-sm font-medium text-[var(--status-leave)]">Congés</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <div className="w-4 h-4 rounded bg-[var(--bg-tertiary)] border border-[var(--border-default)]" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Week-end / Férié</span>
          </div>
        </div>
      </div>
    </div>
  );
}
