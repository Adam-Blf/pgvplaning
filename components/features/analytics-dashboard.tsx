'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Sun,
  Moon,
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
import { useHistory } from '@/hooks/use-history';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration des couleurs par statut (style Data Viz)
const STATUS_COLORS = {
  work: {
    primary: '#10b981',
    secondary: '#34d399',
    gradient: ['#10b981', '#059669'],
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  remote: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    gradient: ['#8b5cf6', '#7c3aed'],
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
  },
  school: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    gradient: ['#f59e0b', '#d97706'],
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  leave: {
    primary: '#ec4899',
    secondary: '#f472b6',
    gradient: ['#ec4899', '#db2777'],
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
  },
};

// Données fictives pour les tendances
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
  const [isDark, setIsDark] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('analytics');

  const { data: calendarData } = useCalendarData();
  const stats = useCalendarStats(calendarData, currentYear);
  const { history, regenerateIcs } = useHistory();

  // Appliquer le thème
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Générer les données mensuelles pour le graphique
  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc',
    ];

    return months.map((month) => {
      // Simuler une répartition basée sur les stats globales avec variation
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
    { name: 'Bureau', value: stats.work, color: STATUS_COLORS.work.primary },
    { name: 'Télétravail', value: stats.remote, color: STATUS_COLORS.remote.primary },
    { name: 'Formation', value: stats.school, color: STATUS_COLORS.school.primary },
    { name: 'Congés', value: stats.leave, color: STATUS_COLORS.leave.primary },
  ], [stats]);

  // Navigation items
  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier' },
    { id: 'exports', icon: FileText, label: 'Exports' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
  ];

  // Formater l'historique pour la table
  const recentExports = useMemo(() => {
    return history.slice(0, 5).map((item) => ({
      id: item.id,
      date: format(new Date(item.createdAt), 'dd MMM yyyy', { locale: fr }),
      time: format(new Date(item.createdAt), 'HH:mm', { locale: fr }),
      type: item.periods.length > 1 ? 'Multi-périodes' : 'Simple',
      filename: `vacances-${item.employeeName.toLowerCase().replace(/\s+/g, '-')}.ics`,
      employeeName: item.employeeName,
      original: item,
    }));
  }, [history]);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-900' : 'bg-gray-50'} transition-colors duration-300 ${className}`}>
      {/* Sidebar */}
      <aside className={`w-64 fixed h-full ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} border-r backdrop-blur-xl z-50`}>
        {/* Logo */}
        <div className={`h-16 flex items-center px-6 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-violet-600 to-purple-700'} flex items-center justify-center shadow-lg shadow-violet-500/25`}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>PGV Planning</h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>v9.0.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeNav === item.id
                  ? isDark
                    ? 'bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/10'
                    : 'bg-violet-100 text-violet-700'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'border-slate-700' : 'border-gray-200'} border-t`}>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-3">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {isDark ? 'Mode Sombre' : 'Mode Clair'}
            </span>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-violet-500' : 'bg-gray-300'}`}>
              <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-transform shadow-sm ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className={`h-16 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} border-b backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between`}>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Analytics & Exports
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Vue d&apos;ensemble de votre activité {currentYear}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isDark
                    ? 'hover:bg-slate-700/50'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Utilisateur
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Admin
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              </button>

              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border shadow-xl py-2`}>
                  <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <User className="w-4 h-4" />
                    Mon Profil
                  </button>
                  <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <hr className={`my-2 ${isDark ? 'border-slate-700' : 'border-gray-200'}`} />
                  <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
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
            {/* Bureau */}
            <KPICard
              isDark={isDark}
              title="Jours au Bureau"
              value={stats.work}
              percentage={stats.percentages.work}
              trend={TRENDS.work}
              icon={Briefcase}
              colors={STATUS_COLORS.work}
            />

            {/* Télétravail */}
            <KPICard
              isDark={isDark}
              title="Jours de Télétravail"
              value={stats.remote}
              percentage={stats.percentages.remote}
              trend={TRENDS.remote}
              icon={Monitor}
              colors={STATUS_COLORS.remote}
            />

            {/* Formation */}
            <KPICard
              isDark={isDark}
              title="Jours de Formation"
              value={stats.school}
              percentage={stats.percentages.school}
              trend={TRENDS.school}
              icon={GraduationCap}
              colors={STATUS_COLORS.school}
            />

            {/* Congés */}
            <KPICard
              isDark={isDark}
              title="Jours de Congés"
              value={stats.leave}
              percentage={stats.percentages.leave}
              trend={TRENDS.leave}
              icon={Palmtree}
              colors={STATUS_COLORS.leave}
            />
          </div>

          {/* Charts - Middle Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Area Chart */}
            <div className={`xl:col-span-2 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} border p-6 backdrop-blur-xl`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Répartition Mensuelle
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Bureau vs Télétravail par mois
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                  <BarChart3 className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorBureau" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={STATUS_COLORS.work.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={STATUS_COLORS.work.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTeletravail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={STATUS_COLORS.remote.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={STATUS_COLORS.remote.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#334155' : '#e5e7eb'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                      }}
                      labelStyle={{ color: isDark ? '#ffffff' : '#111827', fontWeight: 600 }}
                      itemStyle={{ color: isDark ? '#94a3b8' : '#6b7280' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bureau"
                      name="Bureau"
                      stroke={STATUS_COLORS.work.primary}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBureau)"
                    />
                    <Area
                      type="monotone"
                      dataKey="teletravail"
                      name="Télétravail"
                      stroke={STATUS_COLORS.remote.primary}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTeletravail)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className={`rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} border p-6 backdrop-blur-xl`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Répartition Globale
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {stats.total} jours travaillés
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                  <PieChartIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
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
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                      }}
                      formatter={(value) => [`${value} jours`, '']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
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
          <div className={`rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} border backdrop-blur-xl overflow-hidden`}>
            <div className="p-6 flex items-center justify-between border-b border-inherit">
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Exports Récents
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Historique des fichiers ICS générés
                </p>
              </div>
              <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                <Table className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'bg-slate-700/30' : 'bg-gray-50'}>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Date
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Employé
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Type
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Fichier
                    </th>
                    <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inherit">
                  {recentExports.length > 0 ? (
                    recentExports.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                              <Clock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.date}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {item.time}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {item.employeeName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              {item.employeeName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            item.type === 'Multi-périodes'
                              ? isDark
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'bg-violet-100 text-violet-700'
                              : isDark
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
                            <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                              {item.filename}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => regenerateIcs(item.original)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isDark
                                ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                            }`}
                          >
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className={`inline-flex flex-col items-center gap-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          <FileText className="w-12 h-12 opacity-50" />
                          <p className="text-sm">Aucun export récent</p>
                          <p className="text-xs opacity-75">
                            Les fichiers ICS générés apparaîtront ici
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
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
  isDark: boolean;
  title: string;
  value: number;
  percentage: number;
  trend: { value: number; isPositive: boolean };
  icon: React.ElementType;
  colors: typeof STATUS_COLORS.work;
}

function KPICard({ isDark, title, value, percentage, trend, icon: Icon, colors }: KPICardProps) {
  return (
    <div className={`rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'} border p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isDark ? 'hover:shadow-black/20' : 'hover:shadow-gray-200/50'}`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
          trend.isPositive
            ? isDark
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-emerald-100 text-emerald-700'
            : isDark
              ? 'bg-red-500/20 text-red-400'
              : 'bg-red-100 text-red-700'
        }`}>
          {trend.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {trend.isPositive ? '+' : '-'}{trend.value}%
        </div>
      </div>

      <div className="mt-4">
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
        <div className="flex items-end gap-2 mt-1">
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'} mb-1`}>
            jours
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${colors.gradient[0]}, ${colors.gradient[1]})`,
            }}
          />
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          {percentage.toFixed(1)}% du total
        </p>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
