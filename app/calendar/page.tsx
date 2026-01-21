'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarGrid, Birthday } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import {
  Calendar,
  Briefcase,
  Home,
  GraduationCap,
  Presentation,
  Palmtree,
  Cake,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

type Tool = DayStatus | 'ERASER';

// Configuration de la legende avec le design system
const legendItems = [
  {
    icon: Briefcase,
    label: 'Bureau',
    colorClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    dotClass: 'bg-indigo-500'
  },
  {
    icon: Home,
    label: 'Teletravail',
    colorClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    dotClass: 'bg-emerald-500'
  },
  {
    icon: GraduationCap,
    label: 'Formation',
    colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    dotClass: 'bg-amber-500'
  },
  {
    icon: Presentation,
    label: 'Reunion',
    colorClass: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    dotClass: 'bg-violet-500'
  },
  {
    icon: Palmtree,
    label: 'Conges',
    colorClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    dotClass: 'bg-rose-500'
  },
  {
    icon: Cake,
    label: 'Anniversaire',
    colorClass: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    dotClass: 'bg-pink-500'
  },
];

// Composant Skeleton pour le chargement
function CalendarSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Days header skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-8 rounded-lg" />
        ))}
      </div>

      {/* Calendar grid skeleton */}
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
          Apercu rapide
        </span>
      </div>

      <div className="space-y-2">
        {upcomingBirthdays.length > 0 ? (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-[var(--text-secondary)]">
              {upcomingBirthdays.length} anniversaire{upcomingBirthdays.length > 1 ? 's' : ''} ce mois
            </span>
          </div>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            Aucun anniversaire proche
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CalendarPage() {
  const [currentTool, setCurrentTool] = useState<Tool>('WORK');
  const [currentHalfDay, setCurrentHalfDay] = useState<HalfDay>('FULL');
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const { getDayStatus, getHalfDayStatus, hasSplitDay, setDayStatus, formatDateKey } = useCalendarData();

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
        // Simuler un delai minimum pour l'UX
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    fetchBirthdays();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.header
        variants={itemVariants}
        className="relative"
      >
        {/* Background glow effect */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Titre et description */}
          <div className="flex items-start gap-4">
            <motion.div
              className="relative flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-14 h-14 rounded-2xl gradient-amber flex items-center justify-center shadow-lg glow-amber">
                <Calendar className="w-7 h-7 text-black" />
              </div>
              {/* Indicateur de mode peinture */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--bg-base)] flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-[var(--text-primary)]">Mon </span>
                <span className="gradient-text-amber">Calendrier</span>
              </h1>
              <p className="text-sm text-[var(--text-secondary)] max-w-md">
                Cliquez ou glissez pour marquer vos journees.
                Utilisez la barre d&apos;outils pour changer de mode.
              </p>
            </div>
          </div>

          {/* Actions et badges */}
          <div className="flex items-center gap-3">
            <QuickStats birthdays={birthdays} />

            <motion.div
              className="badge-amber hidden sm:flex"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mode peinture actif</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Divider */}
      <motion.div variants={itemVariants} className="divider" />

      {/* Toolbar Section */}
      <motion.section variants={itemVariants}>
        <PaintingToolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          currentHalfDay={currentHalfDay}
          onHalfDayChange={setCurrentHalfDay}
        />
      </motion.section>

      {/* Calendar Section */}
      <motion.section variants={itemVariants}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CalendarSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
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

      {/* Legend Section - Collapsible sur mobile */}
      <motion.section variants={itemVariants} className="space-y-3">
        {/* Toggle pour mobile */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full sm:hidden flex items-center justify-between px-4 py-3 card-interactive"
        >
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Legende des statuts
          </span>
          <motion.div
            animate={{ rotate: showLegend ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          </motion.div>
        </button>

        {/* Legend items */}
        <AnimatePresence>
          {(showLegend || typeof window !== 'undefined') && (
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
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.15 }
                      }}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl border
                        text-xs font-medium cursor-default
                        transition-all duration-200
                        ${item.colorClass}
                        hover:shadow-md
                      `}
                    >
                      <div className={`w-2 h-2 rounded-full ${item.dotClass}`} />
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Tips Section - Desktop only */}
      <motion.section
        variants={itemVariants}
        className="hidden md:block"
      >
        <div className="glass rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Astuce du jour
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Maintenez le clic et glissez pour peindre plusieurs jours d&apos;un coup.
                Utilisez la gomme pour effacer rapidement vos selections.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
