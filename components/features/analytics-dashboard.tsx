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
  Legend,
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
  Sparkles,
  Activity,
} from 'lucide-react';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-elevated rounded-xl p-4 shadow-xl"
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
        </motion.div>
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
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center shadow-lg glow-amber-sm">
              <Calendar className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">Absencia</h1>
              <p className="text-xs text-[var(--text-tertiary)]">v9.0.0</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.4 }}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                activeNav === item.id
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 glow-amber-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {activeNav === item.id && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Stats Mini */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-subtle)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="card p-4"
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
          </motion.div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="h-16 glass-elevated border-b border-[var(--border-subtle)] sticky top-0 z-40 px-8 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Analytics & Exports
              </h2>
              <div className="badge-amber">
                <Sparkles className="w-3 h-3" />
                {currentYear}
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Vue d&apos;ensemble de votre activite
            </p>
          </motion.div>

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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-[var(--bg-overlay)]"
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
                <motion.div
                  animate={{ rotate: isProfileOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-48 rounded-xl glass-elevated py-2 shadow-xl"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 space-y-6"
        >
          {/* KPI Cards - Top Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
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
          </motion.div>

          {/* Charts - Middle Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Area/Bar Chart */}
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="xl:col-span-2 card p-6 hover:border-[var(--border-default)]"
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
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <filter id="glowRemote" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
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
            </motion.div>

            {/* Donut Chart */}
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="card p-6 hover:border-[var(--border-default)]"
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
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
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
                  <motion.div
                    key={entry.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors cursor-default"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-[var(--text-secondary)]">{entry.name}</span>
                    <span className="text-xs font-medium text-[var(--text-primary)] ml-auto">{entry.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* History Table - Bottom Row */}
          <motion.div
            variants={itemVariants}
            className="card overflow-hidden"
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
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex flex-col items-center gap-4"
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
                      </motion.div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "card p-6 relative overflow-hidden transition-all duration-500",
        isHovered && styles.glow,
        isHovered && "border-[var(--border-default)]"
      )}
    >
      {/* Background glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${styles.color}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              "p-3 rounded-xl border transition-all duration-300",
              styles.bg,
              styles.border,
              isHovered && styles.glow
            )}
          >
            <Icon className={cn("w-6 h-6", styles.text)} />
          </motion.div>

          <motion.div
            animate={{ scale: isHovered ? 1.05 : 1 }}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border",
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </motion.div>
        </div>

        <div className="mt-5">
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <div className="flex items-end gap-2 mt-1">
            <motion.p
              className="text-4xl font-bold"
              animate={{
                color: isHovered ? styles.color : 'var(--text-primary)'
              }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.p>
            <p className="text-sm text-[var(--text-tertiary)] mb-1.5">
              jours
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="h-2 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${styles.gradient[0]}, ${styles.gradient[1]})`,
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ width: '50%' }}
              />
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[var(--text-tertiary)]">
              {percentage.toFixed(1)}% du total
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className={cn("w-2 h-2 rounded-full", styles.text)}
              style={{ backgroundColor: styles.color }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AnalyticsDashboard;
