'use client';

import { ReactNode, useState, useMemo } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Settings,
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

const statusConfig = {
  work: { icon: Briefcase, label: 'Bureau', color: 'bg-indigo-500', text: 'text-indigo-400' },
  remote: { icon: Home, label: 'Télétravail', color: 'bg-emerald-500', text: 'text-emerald-400' },
  school: { icon: GraduationCap, label: 'Formation', color: 'bg-amber-500', text: 'text-amber-400' },
  leave: { icon: Palmtree, label: 'Congés', color: 'bg-rose-500', text: 'text-rose-400' },
};

// Routes qui ne doivent pas afficher le shell (authentification)
const authRoutes = ['/login', '/auth'];

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const { data, isLoaded } = useCalendarData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const stats = useCalendarStats(data, currentYear);

  // Si on est sur une route d'authentification, afficher uniquement le contenu
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
          'bg-slate-900/95 backdrop-blur-sm border-r border-slate-800/50',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-bold text-white text-lg">PGV</span>
                <span className="text-slate-400 text-xs block -mt-1">Planning</span>
              </div>
            )}
          </Link>
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-indigo-400')} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats */}
        {!sidebarCollapsed && (
          <div className="px-3 py-4 border-t border-slate-800/50">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
              {currentYear}
            </p>
            <div className="space-y-1">
              {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                const config = statusConfig[key];
                const Icon = config.icon;
                const value = stats[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', config.text)} />
                      <span className="text-xs text-slate-400">{config.label}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggle */}
        <div className="p-3 border-t border-slate-800/50">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 flex-shrink-0">
          <div>
            <h1 className="text-base font-semibold text-white">
              {navigation.find((n) => n.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
