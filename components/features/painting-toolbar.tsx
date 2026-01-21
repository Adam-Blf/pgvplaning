'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Eraser, Briefcase, Home, GraduationCap, Presentation, Palmtree, Sun, Moon, Clock, Paintbrush } from 'lucide-react';
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
  { id: 'FULL', label: 'Journee complete', shortLabel: 'Jour', icon: Clock },
  { id: 'AM', label: 'Matin', shortLabel: 'AM', icon: Sun },
  { id: 'PM', label: 'Apres-midi', shortLabel: 'PM', icon: Moon },
];

const tools: ToolConfig[] = [
  {
    id: 'WORK',
    label: 'Bureau',
    shortLabel: 'Bureau',
    icon: Briefcase,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500',
    glowColor: 'shadow-indigo-500/40',
  },
  {
    id: 'REMOTE',
    label: 'Teletravail',
    shortLabel: 'Remote',
    icon: Home,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    glowColor: 'shadow-emerald-500/40',
  },
  {
    id: 'SCHOOL',
    label: 'Formation recue',
    shortLabel: 'Formation',
    icon: GraduationCap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
    glowColor: 'shadow-amber-500/40',
  },
  {
    id: 'TRAINER',
    label: 'Formateur/Reunion',
    shortLabel: 'Formateur',
    icon: Presentation,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500',
    glowColor: 'shadow-violet-500/40',
  },
  {
    id: 'LEAVE',
    label: 'Conges',
    shortLabel: 'Conges',
    icon: Palmtree,
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
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="glass-elevated rounded-2xl overflow-hidden"
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
            Type de journee
          </legend>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {tools.map((tool, index) => {
                const isActive = currentTool === tool.id;
                const Icon = tool.icon;

                return (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToolChange(tool.id)}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                      'transition-colors duration-200',
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
                      <motion.div
                        layoutId="tool-glow"
                        className={cn(
                          'absolute inset-0 rounded-xl',
                          tool.bgColor,
                          'opacity-20 blur-xl'
                        )}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{tool.label}</span>
                    <span className="relative z-10 sm:hidden">{tool.shortLabel}</span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full shadow-lg z-20"
                      />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {/* Divider */}
            <div className="w-px h-9 bg-[var(--border-default)] mx-1 self-center hidden sm:block" />

            {/* Eraser */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToolChange('ERASER')}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                'transition-colors duration-200',
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
              title="Effacer / Reinitialiser"
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden sm:inline">Gomme</span>

              {currentTool === 'ERASER' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--text-primary)] rounded-full shadow-lg"
                />
              )}
            </motion.button>
          </div>
        </fieldset>

        {/* Divider */}
        <div className="divider" />

        {/* Half-day Selection */}
        <fieldset>
          <legend className="text-xs font-medium text-[var(--text-tertiary)] mb-3 uppercase tracking-wider">
            Granularite
          </legend>

          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
            {halfDayOptions.map((option) => {
              const isActive = currentHalfDay === option.id;
              const Icon = option.icon;

              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onHalfDayChange(option.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                    'transition-colors duration-200',
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  )}
                  aria-pressed={isActive}
                >
                  {/* Background pill for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="halfday-pill"
                      className="absolute inset-0 bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}

                  <Icon className={cn(
                    'w-4 h-4 relative z-10 transition-colors duration-200',
                    isActive && 'text-amber-500'
                  )} />
                  <span className="relative z-10 hidden sm:inline">{option.label}</span>
                  <span className="relative z-10 sm:hidden">{option.shortLabel}</span>
                </motion.button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </motion.div>
  );
}
