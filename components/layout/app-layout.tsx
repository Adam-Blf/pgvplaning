'use client';

import { ReactNode, useMemo } from 'react';
import { AppSidebar } from './app-sidebar';
import { WorldWrapper } from './world-wrapper';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data, isLoaded } = useCalendarData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const stats = useCalendarStats(data, currentYear);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <AppSidebar stats={stats} year={currentYear} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <WorldWrapper>
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </WorldWrapper>
      </main>
    </div>
  );
}
