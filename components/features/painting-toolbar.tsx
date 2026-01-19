'use client';

import { Eraser, Briefcase, Home, GraduationCap, Presentation, Palmtree, Sun, Moon, Clock } from 'lucide-react';
import { DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils/cn';

type Tool = DayStatus | 'ERASER';

interface ToolConfig {
  id: Tool;
  label: string;
  icon: React.ElementType;
  className: string;
  activeClass: string;
}

interface HalfDayConfig {
  id: HalfDay;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const halfDayOptions: HalfDayConfig[] = [
  { id: 'FULL', label: 'Journée complète', shortLabel: 'Journée', icon: Clock },
  { id: 'AM', label: 'Matin', shortLabel: 'Matin', icon: Sun },
  { id: 'PM', label: 'Après-midi', shortLabel: 'Après-midi', icon: Moon },
];

const tools: ToolConfig[] = [
  {
    id: 'WORK',
    label: 'Bureau',
    icon: Briefcase,
    className: 'tool-btn-work',
    activeClass: 'active',
  },
  {
    id: 'REMOTE',
    label: 'Télétravail',
    icon: Home,
    className: 'tool-btn-remote',
    activeClass: 'active',
  },
  {
    id: 'SCHOOL',
    label: 'Formation reçue',
    icon: GraduationCap,
    className: 'tool-btn-training',
    activeClass: 'active',
  },
  {
    id: 'TRAINER',
    label: 'Formateur/Réunion',
    icon: Presentation,
    className: 'tool-btn-trainer',
    activeClass: 'active',
  },
  {
    id: 'LEAVE',
    label: 'Congés',
    icon: Palmtree,
    className: 'tool-btn-leave',
    activeClass: 'active',
  },
];

interface PaintingToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  currentHalfDay: HalfDay;
  onHalfDayChange: (halfDay: HalfDay) => void;
}

export function PaintingToolbar({
  currentTool,
  onToolChange,
  currentHalfDay,
  onHalfDayChange
}: PaintingToolbarProps) {
  return (
    <div className="card space-y-4">
      {/* Tool Selection */}
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
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
                  'tool-btn',
                  tool.className,
                  isActive && tool.activeClass
                )}
                aria-pressed={isActive}
              >
                <Icon className="w-4 h-4" />
                {tool.label}
              </button>
            );
          })}

          {/* Separator */}
          <div className="h-8 w-px bg-[var(--border-subtle)] mx-1 hidden sm:block" />

          {/* Eraser */}
          <button
            onClick={() => onToolChange('ERASER')}
            className={cn(
              'tool-btn tool-btn-eraser',
              currentTool === 'ERASER' && 'active'
            )}
            aria-pressed={currentTool === 'ERASER'}
            title="Effacer / Réinitialiser"
          >
            <Eraser className="w-4 h-4" />
            <span>Gomme</span>
          </button>
        </div>
      </fieldset>

      {/* Half-day Selection */}
      <fieldset className="pt-4 border-t border-[var(--border-subtle)]">
        <legend className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
          Granularité
        </legend>

        <div className="flex items-center gap-2">
          {halfDayOptions.map((option) => {
            const isActive = currentHalfDay === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => onHalfDayChange(option.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  'border border-[var(--border-default)]',
                  isActive
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)]'
                )}
                aria-pressed={isActive}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
