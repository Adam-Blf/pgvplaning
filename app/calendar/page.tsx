'use client';

import { useState } from 'react';
import { CalendarGrid } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus } from '@/hooks/use-calendar-data';
import { Info } from 'lucide-react';

type Tool = DayStatus | 'ERASER';

export default function CalendarPage() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const { getDayStatus, setDayStatus, formatDateKey } = useCalendarData();

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="fr-alert fr-alert--info">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Mode de saisie</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Sélectionnez un type de journée ci-dessous, puis cliquez ou glissez sur les jours du calendrier
              pour les marquer. Les week-ends ne sont pas sélectionnables. Utilisez la gomme pour effacer.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="fr-card">
        <PaintingToolbar currentTool={currentTool} onToolChange={setCurrentTool} />
      </div>

      {/* Calendar */}
      <div className="fr-card fr-card--shadow">
        <CalendarGrid
          currentTool={currentTool}
          getDayStatus={getDayStatus}
          setDayStatus={setDayStatus}
          formatDateKey={formatDateKey}
        />
      </div>

      {/* Légende */}
      <div className="fr-card">
        <h3 className="font-bold text-[var(--text-title)] mb-3">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--info-bg)] border-l-[3px] border-[var(--bleu-france)]" />
            <span className="text-sm text-[var(--text-default)]">Bureau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--success-bg)] border-l-[3px] border-[var(--success)]" />
            <span className="text-sm text-[var(--text-default)]">Télétravail</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--warning-bg)] border-l-[3px] border-[var(--warning)]" />
            <span className="text-sm text-[var(--text-default)]">Formation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--error-bg)] border-l-[3px] border-[var(--error)]" />
            <span className="text-sm text-[var(--text-default)]">Congés</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--background-contrast)] border border-[var(--border-default)]" />
            <span className="text-sm text-[var(--text-default)]">Jour férié / Week-end</span>
          </div>
        </div>
      </div>
    </div>
  );
}
