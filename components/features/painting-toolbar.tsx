'use client';

import { motion } from 'framer-motion';
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
  ringColor: string;
}

const tools: ToolConfig[] = [
  {
    id: 'WORK',
    label: 'Bureau',
    color: 'bg-emerald-500',
    bgActive: 'bg-emerald-50',
    textActive: 'text-emerald-600',
    ringColor: 'ring-emerald-500',
  },
  {
    id: 'REMOTE',
    label: 'Télétravail',
    color: 'bg-purple-500',
    bgActive: 'bg-purple-50',
    textActive: 'text-purple-600',
    ringColor: 'ring-purple-500',
  },
  {
    id: 'SCHOOL',
    label: 'Formation',
    color: 'bg-orange-500',
    bgActive: 'bg-orange-50',
    textActive: 'text-orange-600',
    ringColor: 'ring-orange-500',
  },
  {
    id: 'LEAVE',
    label: 'Congés',
    color: 'bg-pink-500',
    bgActive: 'bg-pink-50',
    textActive: 'text-pink-600',
    ringColor: 'ring-pink-500',
  },
];

interface PaintingToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

export function PaintingToolbar({ currentTool, onToolChange }: PaintingToolbarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/50 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <p className="text-xs text-slate-400 font-semibold uppercase hidden md:block">
          Outils :
        </p>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {tools.map((tool) => {
            const isActive = currentTool === tool.id;

            return (
              <motion.button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                  isActive
                    ? `${tool.bgActive} ${tool.textActive} border-current ring-2 ${tool.ringColor} ring-offset-2`
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={isActive ? { y: -2 } : { y: 0 }}
              >
                <div className={cn('w-3 h-3 rounded-full', tool.color)} />
                {tool.label}
              </motion.button>
            );
          })}

          <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />

          <motion.button
            onClick={() => onToolChange('ERASER')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              currentTool === 'ERASER'
                ? 'bg-slate-100 text-slate-700 border-slate-300 ring-2 ring-slate-400 ring-offset-2'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={currentTool === 'ERASER' ? { y: -2 } : { y: 0 }}
            title="Effacer / Réinitialiser"
          >
            <Eraser className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Gomme</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
