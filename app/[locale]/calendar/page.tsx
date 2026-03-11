'use client';

import { useState, useEffect } from 'react';

import { CalendarGrid, Birthday } from '@/components/features/calendar-grid';
import { PaintingToolbar } from '@/components/features/painting-toolbar';
import { useCalendarData, DayStatus, HalfDay } from '@/hooks/use-calendar-data';
import { useTranslations } from 'next-intl';
import {
  Info,
  ChevronDown
} from 'lucide-react';
import { AnimatedBlueprintIcon } from '@/components/ui/animated-blueprint-icon';
import { authFetch } from '@/lib/auth-fetch';

type Tool = DayStatus | 'ERASER';

// Composant Skeleton pour le chargement
function CalendarSkeleton() {
  return (
    <div className="card p-6 space-y-4" aria-busy="true" aria-label="Chargement…">
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
    <div
      className="glass-elevated rounded-2xl p-4 hidden lg:block animate-scale-in"
      style={{ animationDelay: '150ms' }}
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
    </div>
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

  // Configuration de la légende harmonisée avec toolbar et calendrier
  const legendItems = [
    {
      iconName: 'Office' as const,
      label: tL('office'),
      colorClass: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      dotClass: 'bg-indigo-500'
    },
    {
      iconName: 'Home' as const,
      label: tL('home'),
      colorClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dotClass: 'bg-emerald-500'
    },
    {
      iconName: 'Education' as const,
      label: tL('education'),
      colorClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dotClass: 'bg-amber-500'
    },
    {
      iconName: 'Meeting' as const,
      label: tL('meeting'),
      colorClass: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
      dotClass: 'bg-violet-500'
    },
    {
      iconName: 'Vacation' as const,
      label: tL('vacation'),
      colorClass: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dotClass: 'bg-rose-500'
    },
    {
      iconName: 'Cake' as const,
      label: tL('birthday'),
      colorClass: 'bg-pink-400/10 border-pink-400/30 text-pink-300',
      dotClass: 'bg-pink-400'
    },
  ];

  // Fetch team birthdays
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await authFetch('/api/teams/birthdays');
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

  return (
    <div className="space-y-6 pb-8 stagger-children">
      <header className="relative animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
              <div className="w-14 h-14 rounded-2xl gradient-amber flex items-center justify-center shadow-lg glow-amber overflow-hidden">
                <AnimatedBlueprintIcon name="Office" className="text-white" size="lg" />
              </div>
            </div>
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
      </header>

      <div className="divider animate-fade-up opacity-0" style={{ animationDelay: '80ms' }} />

      <section className="animate-fade-up opacity-0" style={{ animationDelay: '160ms' }}>
        <PaintingToolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          currentHalfDay={currentHalfDay}
          onHalfDayChange={setCurrentHalfDay}
        />
      </section>

      <section className="animate-fade-up opacity-0" style={{ animationDelay: '240ms' }}>
        {isLoading ? (
          <div className="animate-fade-in">
            <CalendarSkeleton />
          </div>
        ) : (
          <div className="animate-fade-up opacity-0">
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
          </div>
        )}
      </section>

      <section className="space-y-3 animate-fade-up opacity-0" style={{ animationDelay: '320ms' }}>
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          className="w-full sm:hidden flex items-center justify-between px-4 py-3 card-interactive"
        >
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {tL('title')}
          </span>
          <div className={`transition-transform duration-200 ${showLegend ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
        </button>

        {(showLegend || (typeof window !== 'undefined' && window.innerWidth >= 640)) && (
          <div className={`overflow-hidden ${!showLegend ? 'hidden sm:block' : ''}`}>
            <div className="card p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {legendItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-default transition-colors duration-200 ${item.colorClass}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${item.dotClass}`} />
                    <AnimatedBlueprintIcon name={item.iconName} className="w-3.5 h-3.5" animateOnMount={false} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="hidden md:block animate-fade-up opacity-0" style={{ animationDelay: '400ms' }}>
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
      </section>
    </div>
  );
}
