'use client';

import { Eraser, Sun, Moon, Clock, Paintbrush } from 'lucide-react';
import { PremiumIcons } from '@/components/ui/premium-icons';
import { DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

type Tool = DayStatus | 'ERASER';

interface ToolConfig {
  id: Tool;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  glowColor: string;
}

interface HalfDayConfig {
  id: HalfDay;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const halfDayOptions: HalfDayConfig[] = [
  { id: 'FULL', label: 'Journée complète', shortLabel: 'Jour', icon: Clock },
  { id: 'AM', label: 'Matin', shortLabel: 'AM', icon: Sun },
  { id: 'PM', label: 'Après-midi', shortLabel: 'PM', icon: Moon },
];

const tools: ToolConfig[] = [
  {
    id: 'WORK',
    label: 'Bureau',
    shortLabel: 'Bureau',
    icon: PremiumIcons.Office,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500',
    glowColor: 'shadow-indigo-500/40',
  },
  {
    id: 'REMOTE',
    label: 'Télétravail',
    shortLabel: 'Remote',
    icon: PremiumIcons.Home,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    glowColor: 'shadow-emerald-500/40',
  },
  {
    id: 'SCHOOL',
    label: 'Formation reçue',
    shortLabel: 'Formation',
    icon: PremiumIcons.Education,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    glowColor: 'shadow-amber-500/40',
  },
  {
    id: 'TRAINER',
    label: 'Formateur/Réunion',
    shortLabel: 'Formateur',
    icon: PremiumIcons.Meeting,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500',
    glowColor: 'shadow-violet-500/40',
  },
  {
    id: 'LEAVE',
    label: 'Congés',
    shortLabel: 'Congés',
    icon: PremiumIcons.Vacation,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500',
    glowColor: 'shadow-rose-500/40',
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
    <div
      className="glass-elevated rounded-2xl overflow-hidden animate-fade-up"
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10">
          <Paintbrush className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Barre d&apos;outils</h3>
          <p className="text-xs text-[var(--text-tertiary)]">Sélectionnez un statut</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tool Selection */}
        <fieldset>
          <legend className="text-xs font-medium text-[var(--text-tertiary)] mb-3 uppercase tracking-wider">
            Type de journée
          </legend>

          <div className="flex flex-wrap gap-2">
              {tools.map((tool, index) => {
                const isActive = currentTool === tool.id;
                const Icon = tool.icon;

                return (
                  <button
                    key={tool.id}
                    onClick={() => onToolChange(tool.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                      'hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-200',
                      'animate-fade-up opacity-0',
                      isActive ? [
                        tool.bgColor,
                        'text-white',
                        'shadow-lg',
                        tool.glowColor,
                      ] : [
                        'bg-[var(--bg-overlay)]',
                        'border border-[var(--border-subtle)]',
                        tool.color,
                        'hover:border-[var(--border-default)]',
                        'hover:bg-[var(--bg-hover)]',
                      ]
                    )}
                    aria-pressed={isActive}
                  >
                    {/* Glow effect when active */}
                    {isActive && (
                      <div
                        className={cn(
                          'absolute inset-0 rounded-xl',
                          tool.bgColor,
                          'opacity-20 blur-xl',
                          'transition-all duration-300'
                        )}
                      />
                    )}

                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{tool.label}</span>
                    <span className="relative z-10 sm:hidden">{tool.shortLabel}</span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full shadow-lg z-20 animate-scale-in"
                      />
                    )}
                  </button>
                );
              })}

            {/* Divider */}
            <div className="w-px h-9 bg-[var(--border-default)] mx-1 self-center hidden sm:block" />

            {/* Eraser */}
            <button
              onClick={() => onToolChange('ERASER')}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                'hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-200',
                currentTool === 'ERASER' ? [
                  'bg-[var(--bg-hover)]',
                  'text-[var(--text-primary)]',
                  'border border-[var(--border-strong)]',
                  'shadow-md',
                ] : [
                  'bg-[var(--bg-overlay)]',
                  'border border-[var(--border-subtle)]',
                  'text-[var(--text-secondary)]',
                  'hover:border-[var(--border-default)]',
                  'hover:bg-[var(--bg-hover)]',
                  'hover:text-[var(--text-primary)]',
                ]
              )}
              aria-pressed={currentTool === 'ERASER'}
              title="Effacer / Réinitialiser"
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden sm:inline">Gomme</span>

              {currentTool === 'ERASER' && (
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--text-primary)] rounded-full shadow-lg animate-scale-in"
                />
              )}
            </button>
          </div>
        </fieldset>

        {/* Divider */}
        <div className="divider" />

        {/* Half-day Selection */}
        <fieldset>
          <legend className="text-xs font-medium text-[var(--text-tertiary)] mb-3 uppercase tracking-wider">
            Granularité
          </legend>

          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
            {halfDayOptions.map((option) => {
              const isActive = currentHalfDay === option.id;
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => onHalfDayChange(option.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                    'hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-200',
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  )}
                  aria-pressed={isActive}
                >
                  {/* Background pill for active state */}
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-lg shadow-sm transition-all duration-300"
                    />
                  )}

                  <Icon className={cn(
                    'w-4 h-4 relative z-10 transition-colors duration-200',
                    isActive && 'text-amber-500'
                  )} />
                  <span className="relative z-10 hidden sm:inline">{option.label}</span>
                  <span className="relative z-10 sm:hidden">{option.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
