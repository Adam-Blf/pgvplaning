'use client';

import { Eraser, Briefcase, Home, GraduationCap, Presentation, Palmtree, Sun, Moon, Clock } from 'lucide-react';
import { DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

type Tool = DayStatus | 'ERASER';

interface ToolConfig {
  id: Tool;
  label: string;
  icon: React.ElementType;
  className: string;
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
    className: 'bg-status-work/10 text-status-work border-status-work hover:bg-status-work hover:text-white',
  },
  {
    id: 'REMOTE',
    label: 'Télétravail',
    icon: Home,
    className: 'bg-status-remote/10 text-status-remote border-status-remote hover:bg-status-remote hover:text-white',
  },
  {
    id: 'SCHOOL',
    label: 'Formation reçue',
    icon: GraduationCap,
    className: 'bg-status-school/10 text-status-school border-status-school hover:bg-status-school hover:text-white',
  },
  {
    id: 'TRAINER',
    label: 'Formateur/Réunion',
    icon: Presentation,
    className: 'bg-violet-500/10 text-violet-500 border-violet-500 hover:bg-violet-500 hover:text-white',
  },
  {
    id: 'LEAVE',
    label: 'Congés',
    icon: Palmtree,
    className: 'bg-status-leave/10 text-status-leave border-status-leave hover:bg-status-leave hover:text-white',
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
    <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-lg space-y-6 backdrop-blur-sm">
      {/* Tool Selection */}
      <fieldset>
        <legend className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <span>Type de journée</span>
          <div className="h-px flex-1 bg-border/50"></div>
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
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ease-out active:scale-95',
                  isActive
                    ? cn(tool.className, 'bg-opacity-100 text-white shadow-lg scale-105')
                    : cn(tool.className, 'bg-opacity-5 border-transparent hover:scale-105 hover:shadow-md')
                )}
                aria-pressed={isActive}
              >
                <Icon className="w-4 h-4" />
                {tool.label}
              </button>
            );
          })}

          {/* Separator */}
          <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block" />

          {/* Eraser */}
          <button
            onClick={() => onToolChange('ERASER')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ease-out active:scale-95',
              currentTool === 'ERASER'
                ? 'bg-muted text-foreground border-border shadow-lg scale-105'
                : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground hover:scale-105'
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
      <fieldset>
        <legend className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
          <span>Granularité</span>
          <div className="h-px flex-1 bg-border/50"></div>
        </legend>

        <div className="inline-flex p-1 rounded-xl bg-muted/30 border border-white/5">
          {halfDayOptions.map((option) => {
            const isActive = currentHalfDay === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => onHalfDayChange(option.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out',
                  isActive
                    ? 'bg-background text-foreground shadow-sm scale-100'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
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
