'use client';

import { Eraser, Briefcase, Home, GraduationCap, Presentation, Palmtree } from 'lucide-react';
import { DayStatus } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils/cn';

type Tool = DayStatus | 'ERASER';

interface ToolConfig {
  id: Tool;
  label: string;
  icon: React.ElementType;
  className: string;
  activeClass: string;
}

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
}

export function PaintingToolbar({ currentTool, onToolChange }: PaintingToolbarProps) {
  return (
    <div className="card">
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
    </div>
  );
}
