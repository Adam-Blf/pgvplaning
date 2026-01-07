'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Home,
  GraduationCap,
  Palmtree,
  BarChart3,
  FileDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardShellProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendrier', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Export', href: '/exports', icon: FileDown },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

const statusIcons = {
  work: Briefcase,
  remote: Home,
  school: GraduationCap,
  leave: Palmtree,
};

const statusLabels = {
  work: 'Bureau',
  remote: 'Télétravail',
  school: 'Formation',
  leave: 'Congés',
};

const statusColors = {
  work: 'bg-violet-500',
  remote: 'bg-emerald-500',
  school: 'bg-amber-500',
  leave: 'bg-rose-500',
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const { data, isLoaded } = useCalendarData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const stats = useCalendarStats(data, currentYear);

  // Attendre le montage côté client
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('pgv-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    document.documentElement.classList.toggle('dark', newValue);
    localStorage.setItem('pgv-theme', newValue ? 'dark' : 'light');
  };

  // Écran de chargement
  if (!mounted || !isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'h-screen flex flex-col flex-shrink-0',
          'bg-slate-900 border-r border-slate-800',
          'transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-white text-lg">
                PGV Planning
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-slate-800',
                  isActive
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-violet-400')} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats rapides */}
        {!sidebarCollapsed && (
          <div className="px-3 py-4 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 px-3">
              Résumé {currentYear}
            </p>
            <div className="space-y-2">
              {(Object.keys(statusIcons) as Array<keyof typeof statusIcons>).map((key) => {
                const Icon = statusIcons[key];
                const value = stats[key];
                const percentage = stats.percentages[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50"
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', statusColors[key])}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">{statusLabels[key]}</p>
                      <p className="text-sm font-semibold text-white">
                        {value}j <span className="text-slate-500 font-normal">({percentage.toFixed(0)}%)</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggle Sidebar */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-white">
              {navigation.find((n) => n.href === pathname)?.name || 'Dashboard'}
            </h1>
            <p className="text-sm text-slate-400">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white',
                'border border-slate-700'
              )}
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
