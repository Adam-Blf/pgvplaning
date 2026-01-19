'use client';

import { Eraser, Briefcase, Home, GraduationCap, Palmtree } from 'lucide-react';
import { DayStatus } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils/cn';

type Tool = DayStatus | 'ERASER';

interface ToolConfig {
  id: Tool;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  activeClass: string;
}

const tools: ToolConfig[] = [
  {
    id: 'WORK',
    label: 'Bureau',
    icon: Briefcase,
    colorClass: 'bg-[var(--info-bg)] text-[var(--bleu-france)] border-[var(--bleu-france)]',
    activeClass: 'bg-[var(--bleu-france)] text-white border-[var(--bleu-france)]',
  },
  {
    id: 'REMOTE',
    label: 'Télétravail',
    icon: Home,
    colorClass: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]',
    activeClass: 'bg-[var(--success)] text-white border-[var(--success)]',
  },
  {
    id: 'SCHOOL',
    label: 'Formation',
    icon: GraduationCap,
    colorClass: 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]',
    activeClass: 'bg-[var(--warning)] text-white border-[var(--warning)]',
  },
  {
    id: 'LEAVE',
    label: 'Congés',
    icon: Palmtree,
    colorClass: 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]',
    activeClass: 'bg-[var(--error)] text-white border-[var(--error)]',
  },
];

interface PaintingToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function PaintingToolbar({ currentTool, onToolChange }: PaintingToolbarProps) {
  return (
    <div className="p-4">
      <fieldset>
        <legend className="text-sm font-bold text-[var(--text-title)] mb-3">
          Sélectionnez un type de journée
        </legend>

        <div className="flex items-center gap-3 flex-wrap">
          {tools.map((tool) => {
            const isActive = currentTool === tool.id;
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded border-2 text-sm font-medium transition-all',
                  isActive ? tool.activeClass : tool.colorClass,
                  !isActive && 'hover:opacity-80'
                )}
                aria-pressed={isActive}
              >
                <Icon className="w-4 h-4" />
                {tool.label}
              </button>
            );
          })}

          {/* Séparateur */}
          <div className="h-8 w-px bg-[var(--border-default)] mx-2 hidden sm:block" />

          {/* Gomme */}
          <button
            onClick={() => onToolChange('ERASER')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded border-2 text-sm font-medium transition-all',
              currentTool === 'ERASER'
                ? 'bg-[var(--text-title)] text-white border-[var(--text-title)]'
                : 'bg-[var(--background-contrast)] text-[var(--text-default)] border-[var(--border-plain)] hover:bg-[var(--background)]'
            )}
            aria-pressed={currentTool === 'ERASER'}
            title="Effacer / Réinitialiser"
          >
            <Eraser className="w-4 h-4" />
            <span>Gomme</span>
          </button>
        </div>
      </fieldset>
    </div>
  );
}
