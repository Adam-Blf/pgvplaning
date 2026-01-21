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
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Briefcase,
  GraduationCap,
  Palmtree,
  Monitor,
  FileText,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Table,
  User,
  Settings,
  Home,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Configuration des couleurs par statut (using CSS variables mapped in tailwind config)
const STATUS_STYLES = {
  work: {
    color: '#6366f1', // Indigo Electric
    bg: 'bg-status-work/10',
    border: 'border-status-work/20',
    text: 'text-status-work',
    gradient: ['#6366f1', '#818cf8'],
  },
  remote: {
    color: '#10b981', // Emerald
    bg: 'bg-status-remote/10',
    border: 'border-status-remote/20',
    text: 'text-status-remote',
    gradient: ['#10b981', '#34d399'],
  },
  school: {
    color: '#f59e0b', // Amber
    bg: 'bg-status-school/10',
    border: 'border-status-school/20',
    text: 'text-status-school',
    gradient: ['#f59e0b', '#fbbf24'],
  },
  leave: {
    color: '#f43f5e', // Rose
    bg: 'bg-status-leave/10',
    border: 'border-status-leave/20',
    text: 'text-status-leave',
    gradient: ['#f43f5e', '#fb7185'],
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

  const { data: calendarData } = useCalendarData();
  const stats = useCalendarStats(calendarData, currentYear);

  // Générer les données mensuelles pour le graphique
  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc',
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

  // Données pour le graphique en donut
  const pieData = useMemo(() => [
    { name: 'Bureau', value: stats.work, color: STATUS_STYLES.work.color },
    { name: 'Télétravail', value: stats.remote, color: STATUS_STYLES.remote.color },
    { name: 'Formation', value: stats.school, color: STATUS_STYLES.school.color },
    { name: 'Congés', value: stats.leave, color: STATUS_STYLES.leave.color },
  ], [stats]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier' },
    { id: 'exports', icon: FileText, label: 'Exports' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ];

  const recentExports: Array<{
    id: string;
    date: string;
    time: string;
    type: string;
    filename: string;
    employeeName: string;
  }> = [];

  return (
    <div className={cn("min-h-screen flex bg-background text-foreground transition-colors duration-300", className)}>
      {/* Sidebar */}
      <aside className="w-64 fixed h-full bg-card/50 border-r border-border/50 backdrop-blur-xl z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">PGV Planning</h1>
              <p className="text-xs text-muted-foreground">v9.0.0</p>
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                activeNav === item.id
                  ? "bg-primary/10 text-primary shadow-glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 bg-background">
        {/* Header */}
        <header className="h-16 bg-card/50 border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Analytics & Exports
            </h2>
            <p className="text-sm text-muted-foreground">
              Vue d&apos;ensemble de votre activité {currentYear}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center ring-2 ring-white/10">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    Utilisateur
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Admin
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-popover border border-white/10 shadow-xl py-2 animate-grade-in">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
                    <User className="w-4 h-4" />
                    Mon Profil
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <hr className="my-2 border-white/10" />
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* KPI Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KPICard
              title="Jours au Bureau"
              value={stats.work}
              percentage={stats.percentages.work}
              trend={TRENDS.work}
              icon={Briefcase}
              styles={STATUS_STYLES.work}
            />

            <KPICard
              title="Jours de Télétravail"
              value={stats.remote}
              percentage={stats.percentages.remote}
              trend={TRENDS.remote}
              icon={Monitor}
              styles={STATUS_STYLES.remote}
            />

            <KPICard
              title="Jours de Formation"
              value={stats.school}
              percentage={stats.percentages.school}
              trend={TRENDS.school}
              icon={GraduationCap}
              styles={STATUS_STYLES.school}
            />

            <KPICard
              title="Jours de Congés"
              value={stats.leave}
              percentage={stats.percentages.leave}
              trend={TRENDS.leave}
              icon={Palmtree}
              styles={STATUS_STYLES.leave}
            />
          </div>

          {/* Charts - Middle Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Area Chart */}
            <div className="xl:col-span-2 rounded-2xl bg-card border border-white/5 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Répartition Mensuelle
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Bureau vs Télétravail par mois
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorBureau" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={STATUS_STYLES.work.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={STATUS_STYLES.work.color} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTeletravail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={STATUS_STYLES.remote.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={STATUS_STYLES.remote.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#334155"
                      vertical={false}
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b', // zinc-950
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#cbd5e1' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bureau"
                      name="Bureau"
                      stroke={STATUS_STYLES.work.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBureau)"
                    />
                    <Area
                      type="monotone"
                      dataKey="teletravail"
                      name="Télétravail"
                      stroke={STATUS_STYLES.remote.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTeletravail)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="rounded-2xl bg-card border border-white/5 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Répartition Globale
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.total} jours travaillés
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20">
                  <PieChartIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      formatter={(value) => [`${value} jours`, '']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-muted-foreground text-sm font-medium">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* History Table - Bottom Row */}
          <div className="rounded-2xl bg-card border border-white/5 backdrop-blur-xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Exports Récents
                </h3>
                <p className="text-sm text-muted-foreground">
                  Historique des fichiers ICS générés
                </p>
              </div>
              <div className="p-2 rounded-lg bg-muted/20">
                <Table className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Employé
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fichier
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-flex flex-col items-center gap-3 text-muted-foreground">
                        <FileText className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Aucun export récent</p>
                        <p className="text-xs opacity-50">
                          Les fichiers ICS générés apparaîtront ici
                        </p>
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

// Composant KPI Card
interface KPICardProps {
  title: string;
  value: number;
  percentage: number;
  trend: { value: number; isPositive: boolean };
  icon: React.ElementType;
  styles: typeof STATUS_STYLES.work;
}

function KPICard({ title, value, percentage, trend, icon: Icon, styles }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="rounded-2xl bg-card border border-white/5 p-6 backdrop-blur-xl shadow-md transition-all duration-300 hover:shadow-glow hover:border-white/10"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl border", styles.bg, styles.border)}>
          <Icon className={cn("w-6 h-6", styles.text)} />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border border-transparent",
          trend.isPositive
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          {trend.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {trend.isPositive ? '+' : '-'}{trend.value}%
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-end gap-2 mt-1">
          <p className="text-3xl font-bold text-foreground">
            {value}
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            jours
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${styles.gradient[0]}, ${styles.gradient[1]})`,
            }}
          />
        </div>
        <p className="text-xs mt-2 text-muted-foreground">
          {percentage.toFixed(1)}% du total
        </p>
      </div>
    </motion.div>
  );
}

export default AnalyticsDashboard;
