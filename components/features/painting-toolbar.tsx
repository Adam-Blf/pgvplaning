'use client';

import { Eraser } from 'lucide-react';
import { DayStatus } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils/cn';

type Tool = DayStatus | 'ERASER';

interface ToolConfig {
  id: Tool;
  label: string;
  color: string;
  bgActive: string;
  textActive: string;
  borderActive: string;
}

const tools: ToolConfig[] = [
  {
    id: 'WORK',
    label: 'Bureau',
    color: 'bg-violet-500',
    bgActive: 'bg-violet-500/20',
    textActive: 'text-violet-400',
    borderActive: 'border-violet-500/50',
  },
  {
    id: 'REMOTE',
    label: 'Télétravail',
    color: 'bg-emerald-500',
    bgActive: 'bg-emerald-500/20',
    textActive: 'text-emerald-400',
    borderActive: 'border-emerald-500/50',
  },
  {
    id: 'SCHOOL',
    label: 'Formation',
    color: 'bg-amber-500',
    bgActive: 'bg-amber-500/20',
    textActive: 'text-amber-400',
    borderActive: 'border-amber-500/50',
  },
  {
    id: 'LEAVE',
    label: 'Congés',
    color: 'bg-rose-500',
    bgActive: 'bg-rose-500/20',
    textActive: 'text-rose-400',
    borderActive: 'border-rose-500/50',
  },
];

interface PaintingToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function PaintingToolbar({ currentTool, onToolChange }: PaintingToolbarProps) {
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <p className="text-xs text-slate-500 font-semibold uppercase hidden md:block">
          Outils :
        </p>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {tools.map((tool) => {
            const isActive = currentTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                  isActive
                    ? `${tool.bgActive} ${tool.textActive} ${tool.borderActive}`
                    : 'border-slate-600 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <div className={cn('w-3 h-3 rounded-full', tool.color)} />
                {tool.label}
              </button>
            );
          })}

          <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block" />

          <button
            onClick={() => onToolChange('ERASER')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              currentTool === 'ERASER'
                ? 'bg-slate-600/50 text-white border-slate-500'
                : 'border-slate-600 text-slate-400 hover:bg-slate-700/50 hover:text-white'
            )}
            title="Effacer / Réinitialiser"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Gomme</span>
          </button>
        </div>
      </div>
    </div>
  );
}
