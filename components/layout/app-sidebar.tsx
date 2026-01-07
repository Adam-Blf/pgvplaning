'use client';

import { motion } from 'framer-motion';
import { Calendar, FileDown, Settings, Layers } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarStats } from '@/hooks/use-calendar-stats';
import { cn } from '@/lib/utils/cn';

interface AppSidebarProps {
  stats: CalendarStats;
  year: number;
}

const navItems = [
  { href: '/', label: 'Calendrier', icon: Calendar },
  { href: '/exports', label: 'Exports & IA', icon: FileDown },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

const statItems = [
  { key: 'work', label: 'Bureau', icon: '🏢', color: 'bg-emerald-500' },
  { key: 'remote', label: 'Télétravail', icon: '🏠', color: 'bg-purple-500' },
  { key: 'school', label: 'Formation', icon: '🎓', color: 'bg-orange-500' },
  { key: 'leave', label: 'Congés', icon: '🌴', color: 'bg-pink-500' },
] as const;

export function AppSidebar({ stats, year }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 flex-shrink-0">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Layers className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">PGV Planning</h1>
          <p className="text-xs text-slate-400 font-medium">Edition Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Stats Panel */}
      <div className="p-5 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
          <span>Année {year}</span>
          <Calendar className="w-4 h-4" />
        </div>

        <div className="space-y-4">
          {statItems.map((item) => {
            const value = stats[item.key];
            const percentage = stats.percentages[item.key];

            return (
              <div key={item.key}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <motion.span
                    className="font-bold text-white"
                    key={value}
                    initial={{ scale: 1.2, color: '#818cf8' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className={cn('h-1.5 rounded-full', item.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
