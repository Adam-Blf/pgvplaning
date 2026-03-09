'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarGrid, Birthday } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { useTranslations } from 'next-intl';
import {
  Info,
  ChevronDown
} from 'lucide-react';
import { AnimatedBlueprintIcon } from '@/components/ui/animated-blueprint-icon';

type Tool = DayStatus | 'ERASER';

// Composant Skeleton pour le chargement
function CalendarSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-8 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="skeleton aspect-square rounded-xl"
            style={{ animationDelay: `${i * 20}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Composant pour afficher les statistiques rapides
function QuickStats({ birthdays }: { birthdays: Birthday[] }) {
  const t = useTranslations('Calendar');
  const today = new Date();
  const upcomingBirthdays = birthdays.filter(b => {
    const bDate = new Date(today.getFullYear(), b.birthMonth - 1, b.birthDay);
    const diff = bDate.getTime() - today.getTime();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 jours
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="glass-elevated rounded-2xl p-4 hidden lg:block"
    >
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {t('quickStats')}
        </span>
      </div>

      <div className="space-y-2">
        {upcomingBirthdays.length > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[var(--text-secondary)]">
              {t('upcomingBirthdays', { count: upcomingBirthdays.length })}
            </span>
          </div>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            {t('noBirthdays')}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CalendarPage() {
  const t = useTranslations('Calendar');
  const tL = useTranslations('Legend');
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const [currentHalfDay, setCurrentHalfDay] = useState<HalfDay>('FULL');
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const { getDayStatus, getHalfDayStatus, hasSplitDay, setDayStatus, formatDateKey } = useCalendarData();

  // Configuration de la légende avec le design system
  const legendItems = [
    {
      iconName: 'Office' as const,
      label: tL('office'),
      colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      dotClass: 'bg-blue-500'
    },
    {
      iconName: 'Home' as const,
      label: tL('home'),
      colorClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      dotClass: 'bg-cyan-500'
    },
    {
      iconName: 'Education' as const,
      label: tL('education'),
      colorClass: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
      dotClass: 'bg-sky-500'
    },
    {
      iconName: 'Meeting' as const,
      label: tL('meeting'),
      colorClass: 'bg-blue-400/10 border-blue-400/30 text-blue-300',
      dotClass: 'bg-blue-400'
    },
    {
      iconName: 'Vacation' as const,
      label: tL('vacation'),
      colorClass: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
      dotClass: 'bg-slate-500'
    },
    {
      iconName: 'Cake' as const,
      label: tL('birthday'),
      colorClass: 'bg-sky-300/10 border-sky-300/30 text-sky-200',
      dotClass: 'bg-sky-300'
    },
  ];

  // Fetch team birthdays
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await fetch('/api/teams/birthdays');
        if (response.ok) {
          const data = await response.json();
          setBirthdays(data.birthdays || []);
        }
      } catch (error) {
        console.error('Error fetching birthdays:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetchBirthdays();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants} className="relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-14 h-14 rounded-2xl gradient-amber flex items-center justify-center shadow-lg glow-amber overflow-hidden">
                <AnimatedBlueprintIcon name="Office" className="text-white" size="lg" />
              </div>
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-[var(--text-primary)]">
                  {t('title').split(' ')[0] + ' '}
                </span>
                <span className="gradient-text-amber">
                  {t('title').split(' ')[1] || ''}
                </span>
              </h1>
              <p className="text-sm text-[var(--text-secondary)] max-w-md">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <QuickStats birthdays={birthdays} />
          </div>
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="divider" />

      <motion.section variants={itemVariants}>
        <PaintingToolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          currentHalfDay={currentHalfDay}
          onHalfDayChange={setCurrentHalfDay}
        />
      </motion.section>

      <motion.section variants={itemVariants}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CalendarSkeleton />
            </motion.div>
          ) : (
            <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <CalendarGrid
                currentTool={currentTool}
                currentHalfDay={currentHalfDay}
                getDayStatus={getDayStatus}
                getHalfDayStatus={getHalfDayStatus}
                hasSplitDay={hasSplitDay}
                setDayStatus={setDayStatus}
                formatDateKey={formatDateKey}
                birthdays={birthdays}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section variants={itemVariants} className="space-y-3">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full sm:hidden flex items-center justify-between px-4 py-3 card-interactive"
        >
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {tL('title')}
          </span>
          <motion.div animate={{ rotate: showLegend ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          </motion.div>
        </button>

        <AnimatePresence>
          {(showLegend || (typeof window !== 'undefined' && window.innerWidth >= 640)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden ${!showLegend ? 'hidden sm:block' : ''}`}
            >
              <div className="card p-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {legendItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-default transition-all duration-200 ${item.colorClass} hover:shadow-md`}
                    >
                      <div className={`w-2 h-2 rounded-full ${item.dotClass}`} />
                      <AnimatedBlueprintIcon name={item.iconName} className="w-3.5 h-3.5" animateOnMount={false} />
                      <span>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section variants={itemVariants} className="hidden md:block">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {t('tip')}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {t('tipText')}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
