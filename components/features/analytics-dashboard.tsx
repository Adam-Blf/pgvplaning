'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Briefcase,
  GraduationCap,
  Palmtree,
  Monitor,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Table,
  User,
  Settings,
  Home,
  LogOut,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import { cn } from '@/lib/utils';


// Configuration des couleurs par statut avec glow effects
const STATUS_STYLES = {
  work: {
    color: '#6366f1',
    colorLight: '#818cf8',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    glow: 'shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]',
    gradient: ['#6366f1', '#818cf8'],
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
  remote: {
    color: '#10b981',
    colorLight: '#34d399',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]',
    gradient: ['#10b981', '#34d399'],
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  school: {
    color: '#f59e0b',
    colorLight: '#fbbf24',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
    gradient: ['#f59e0b', '#fbbf24'],
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
  leave: {
    color: '#f43f5e',
    colorLight: '#fb7185',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]',
    gradient: ['#f43f5e', '#fb7185'],
    glowColor: 'rgba(244, 63, 94, 0.3)',
  },
};

const TRENDS = {
  work: { value: 8, isPositive: true },
  remote: { value: 12, isPositive: true },
  school: { value: 5, isPositive: false },
  leave: { value: 3, isPositive: true },
};



interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [currentYear] = useState(new Date().getFullYear());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('analytics');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const { data: calendarData } = useCalendarData();
  const stats = useCalendarStats(calendarData, currentYear);

  // Generer les donnees mensuelles pour le graphique
  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Dec',
    ];

    return months.map((month) => {
      const variance = () => Math.random() * 4 - 2;
      const baseWork = stats.percentages.work / 100 * 22;
      const baseRemote = stats.percentages.remote / 100 * 22;

      return {
        month,
        bureau: Math.max(0, Math.round(baseWork + variance() * 3)),
        teletravail: Math.max(0, Math.round(baseRemote + variance() * 2)),
      };
    });
  }, [stats]);

  // Donnees pour le graphique en donut
  const pieData = useMemo(() => [
    { name: 'Bureau', value: stats.work, color: STATUS_STYLES.work.color },
    { name: 'Teletravail', value: stats.remote, color: STATUS_STYLES.remote.color },
    { name: 'Formation', value: stats.school, color: STATUS_STYLES.school.color },
    { name: 'Conges', value: stats.leave, color: STATUS_STYLES.leave.color },
  ], [stats]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier' },
    { id: 'exports', icon: FileText, label: 'Exports' },
    { id: 'settings', icon: Settings, label: 'Parametres' },
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="glass-elevated rounded-xl p-4 shadow-xl animate-fade-up opacity-0"
        >
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[var(--text-secondary)]">{entry.name}:</span>
              <span className="font-semibold text-[var(--text-primary)]">{entry.value} jours</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)]", className)}>
      {/* Sidebar */}
      <aside className="w-64 fixed h-full glass border-r border-[var(--border-subtle)] z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)]">
          <div
            className="flex items-center gap-3 animate-fade-up opacity-0"
          >
            <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center shadow-lg glow-amber-sm">
              <Calendar className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">Absencia</h1>
              <p className="text-xs text-[var(--text-tertiary)]">v9.0.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 animate-fade-up opacity-0",
                activeNav === item.id
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 glow-amber-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {activeNav === item.id && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Stats Mini */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-subtle)]">
          <div
            className="card p-4 animate-fade-up opacity-0"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">Activite du mois</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold gradient-text-amber">{stats.total}</p>
                <p className="text-xs text-[var(--text-tertiary)]">jours travailles</p>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-amber-500/30"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      opacity: 0.4 + Math.random() * 0.6
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="h-16 glass-elevated border-b border-[var(--border-subtle)] sticky top-0 z-40 px-8 flex items-center justify-between">
          <div
            className="animate-fade-up opacity-0"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Analytics & Exports
              </h2>
              <div className="badge-amber">
                {currentYear}
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Vue d&apos;ensemble de votre activite
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Chart Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]">
              <button
                onClick={() => setChartType('area')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  chartType === 'area'
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  chartType === 'bar'
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                Bar
              </button>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-[var(--bg-overlay)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-full gradient-amber flex items-center justify-center ring-2 ring-amber-500/20">
                  <User className="w-5 h-5 text-black" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Utilisateur
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Admin
                  </p>
                </div>
                <div
                  className="transition-transform duration-200"
                  style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
              </button>

              {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl glass-elevated py-2 shadow-xl animate-fade-up opacity-0"
                  >
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors">
                      <User className="w-4 h-4" />
                      Mon Profil
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors">
                      <Settings className="w-4 h-4" />
                      Parametres
                    </button>
                    <div className="divider my-2" />
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <LogOut className="w-4 h-4" />
                      Deconnexion
                    </button>
                  </div>
                )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="p-8 space-y-6 stagger-children"
        >
          {/* KPI Cards - Top Row */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-up opacity-0"
          >
            <KPICard
              title="Jours au Bureau"
              value={stats.work}
              percentage={stats.percentages.work}
              trend={TRENDS.work}
              icon={Briefcase}
              styles={STATUS_STYLES.work}
              index={0}
            />

            <KPICard
              title="Jours de Teletravail"
              value={stats.remote}
              percentage={stats.percentages.remote}
              trend={TRENDS.remote}
              icon={Monitor}
              styles={STATUS_STYLES.remote}
              index={1}
            />

            <KPICard
              title="Jours de Formation"
              value={stats.school}
              percentage={stats.percentages.school}
              trend={TRENDS.school}
              icon={GraduationCap}
              styles={STATUS_STYLES.school}
              index={2}
            />

            <KPICard
              title="Jours de Conges"
              value={stats.leave}
              percentage={stats.percentages.leave}
              trend={TRENDS.leave}
              icon={Palmtree}
              styles={STATUS_STYLES.leave}
              index={3}
            />
          </div>

          {/* Charts - Middle Row */}
          <div
            className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-up opacity-0"
          >
            {/* Area/Bar Chart */}
            <div
              className="xl:col-span-2 card p-6 hover:border-[var(--border-default)] hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Repartition Mensuelle
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Bureau vs Teletravail par mois
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorBureau" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={STATUS_STYLES.work.color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={STATUS_STYLES.work.color} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTeletravail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={STATUS_STYLES.remote.color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={STATUS_STYLES.remote.color} stopOpacity={0} />
                        </linearGradient>
                        {/* Glow filters */}
                        <filter id="glowWork" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="glowRemote" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-subtle)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="bureau"
                        name="Bureau"
                        stroke={STATUS_STYLES.work.color}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorBureau)"
                        filter="url(#glowWork)"
                      />
                      <Area
                        type="monotone"
                        dataKey="teletravail"
                        name="Teletravail"
                        stroke={STATUS_STYLES.remote.color}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorTeletravail)"
                        filter="url(#glowRemote)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlyData}>
                      <defs>
                        <linearGradient id="barBureau" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={STATUS_STYLES.work.colorLight} />
                          <stop offset="100%" stopColor={STATUS_STYLES.work.color} />
                        </linearGradient>
                        <linearGradient id="barTeletravail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={STATUS_STYLES.remote.colorLight} />
                          <stop offset="100%" stopColor={STATUS_STYLES.remote.color} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border-subtle)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="bureau"
                        name="Bureau"
                        fill="url(#barBureau)"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="teletravail"
                        name="Teletravail"
                        fill="url(#barTeletravail)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_STYLES.work.color }} />
                  <span className="text-sm text-[var(--text-secondary)]">Bureau</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_STYLES.remote.color }} />
                  <span className="text-sm text-[var(--text-secondary)]">Teletravail</span>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div
              className="card p-6 hover:border-[var(--border-default)] hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Repartition Globale
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {stats.total} jours travailles
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <PieChartIcon className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div className="h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {pieData.map((entry, index) => (
                        <filter key={`glow-${index}`} id={`glowPie${index}`}>
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      ))}
                    </defs>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          filter={`url(#glowPie${index})`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-overlay)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)'
                      }}
                      formatter={(value) => [`${value} jours`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center stat */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold gradient-text-amber">{stats.total}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">total</p>
                  </div>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                {pieData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors cursor-default animate-fade-up opacity-0"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-[var(--text-secondary)]">{entry.name}</span>
                    <span className="text-xs font-medium text-[var(--text-primary)] ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* History Table - Bottom Row */}
          <div
            className="card overflow-hidden animate-fade-up opacity-0"
          >
            <div className="p-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Exports Recents
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Historique des fichiers ICS generes
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Table className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-overlay)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Employe
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Fichier
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div
                        className="inline-flex flex-col items-center gap-4 animate-fade-up opacity-0"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-overlay)] flex items-center justify-center">
                          <FileText className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-secondary)]">Aucun export recent</p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            Les fichiers ICS generes apparaitront ici
                          </p>
                        </div>
                        <button className="btn-secondary text-sm mt-2">
                          <FileText className="w-4 h-4" />
                          Creer un export
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Composant KPI Card avec animations avancees
interface KPICardProps {
  title: string;
  value: number;
  percentage: number;
  trend: { value: number; isPositive: boolean };
  icon: React.ElementType;
  styles: typeof STATUS_STYLES.work;
  index: number;
}

function KPICard({ title, value, percentage, trend, icon: Icon, styles, index }: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "card p-6 relative overflow-hidden transition-all duration-500 animate-fade-up opacity-0 hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1",
        isHovered && styles.glow,
        isHovered && "border-[var(--border-default)]"
      )}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${styles.color}, transparent 70%)`,
          opacity: isHovered ? 0.1 : 0,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              styles.bg,
              styles.border,
              isHovered && styles.glow,
              isHovered && "scale-110 rotate-[5deg]"
            )}
          >
            <Icon className={cn("w-6 h-6", styles.text)} />
          </div>

          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-transform duration-200",
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20",
              isHovered && "scale-105"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <div className="flex items-end gap-2 mt-1">
            <p
              className="text-4xl font-bold transition-colors duration-300"
              style={{ color: isHovered ? styles.color : 'var(--text-primary)' }}
            >
              {value}
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mb-1.5">
              jours
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="h-2 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
            <div
              className="h-full rounded-full relative overflow-hidden transition-all duration-500 ease-out"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${styles.gradient[0]}, ${styles.gradient[1]})`,
              }}
            >
              {/* Shimmer effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer-slide_2s_linear_infinite_1s]"
                style={{ width: '50%' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[var(--text-tertiary)]">
              {percentage.toFixed(1)}% du total
            </p>
            <div
              className={cn("w-2 h-2 rounded-full transition-opacity duration-300", styles.text)}
              style={{ backgroundColor: styles.color, opacity: isHovered ? 1 : 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
