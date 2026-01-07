'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Home,
  GraduationCap,
  Palmtree,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  FileDown,
} from 'lucide-react';
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
} from 'recharts';
import { cn } from '@/lib/utils';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import Link from 'next/link';

// Données pour le graphique mensuel
const generateMonthlyData = (stats: ReturnType<typeof useCalendarStats>) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return months.map((month, index) => ({
    name: month,
    bureau: Math.round(stats.work / 12 + (Math.random() - 0.5) * 5),
    teletravail: Math.round(stats.remote / 12 + (Math.random() - 0.5) * 3),
    formation: Math.round(stats.school / 12 + (Math.random() - 0.5) * 2),
    conges: index === 7 ? Math.round(stats.leave / 2) : Math.round(stats.leave / 24),
  }));
};

const statusConfig = {
  work: {
    label: 'Bureau',
    icon: Briefcase,
    color: 'violet',
    bgGradient: 'from-violet-500/20 to-violet-600/10',
    iconBg: 'bg-violet-500',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    chartColor: '#8b5cf6',
  },
  remote: {
    label: 'Télétravail',
    icon: Home,
    color: 'emerald',
    bgGradient: 'from-emerald-500/20 to-emerald-600/10',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    chartColor: '#10b981',
  },
  school: {
    label: 'Formation',
    icon: GraduationCap,
    color: 'amber',
    bgGradient: 'from-amber-500/20 to-amber-600/10',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    chartColor: '#f59e0b',
  },
  leave: {
    label: 'Congés',
    icon: Palmtree,
    color: 'rose',
    bgGradient: 'from-rose-500/20 to-rose-600/10',
    iconBg: 'bg-rose-500',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    chartColor: '#f43f5e',
  },
};

// Composant Card KPI
function KPICard({
  title,
  value,
  percentage,
  icon: Icon,
  config,
  index,
}: {
  title: string;
  value: number;
  percentage: number;
  icon: React.ElementType;
  config: typeof statusConfig.work;
  index: number;
}) {
  const trend = percentage > 25 ? 'up' : 'down';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-slate-800/50 border border-slate-700/50',
        'p-6 hover:border-slate-600 transition-all duration-300',
        'group'
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          config.bgGradient
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              config.iconBg,
              'shadow-lg',
              `shadow-${config.color}-500/25`
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-slate-700 text-slate-400'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {percentage.toFixed(0)}%
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">
          {value}
          <span className="text-lg text-slate-500 font-normal ml-1">jours</span>
        </p>
      </div>
    </motion.div>
  );
}

// Composant Table des exports
function RecentExportsTable() {
  const exports = [
    { id: 1, date: '2024-01-15', type: 'ICS', periode: 'Janvier 2024', status: 'success' },
    { id: 2, date: '2024-01-10', type: 'PDF', periode: 'Q4 2023', status: 'success' },
    { id: 3, date: '2024-01-05', type: 'ICS', periode: 'Année 2024', status: 'success' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Derniers exports</h3>
          <Link
            href="/export"
            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-700/50">
        {exports.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <FileDown className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.periode}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 bg-slate-700 px-2 py-1 rounded">
                {item.type}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data, isLoaded } = useCalendarData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const stats = useCalendarStats(data, currentYear);
  const monthlyData = useMemo(() => generateMonthlyData(stats), [stats]);

  const pieData = useMemo(
    () => [
      { name: 'Bureau', value: stats.work, color: statusConfig.work.chartColor },
      { name: 'Télétravail', value: stats.remote, color: statusConfig.remote.chartColor },
      { name: 'Formation', value: stats.school, color: statusConfig.school.chartColor },
      { name: 'Congés', value: stats.leave, color: statusConfig.leave.chartColor },
    ],
    [stats]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key, index) => {
          const config = statusConfig[key];
          return (
            <KPICard
              key={key}
              title={config.label}
              value={stats[key]}
              percentage={stats.percentages[key]}
              icon={config.icon}
              config={config}
              index={index}
            />
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Présence mensuelle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Présence mensuelle</h3>
            <div className="flex items-center gap-4">
              {['bureau', 'teletravail'].map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      key === 'bureau' ? 'bg-violet-500' : 'bg-emerald-500'
                    )}
                  />
                  <span className="text-xs text-slate-400 capitalize">
                    {key === 'bureau' ? 'Bureau' : 'Télétravail'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBureau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTeletravail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bureau"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBureau)"
                />
                <Area
                  type="monotone"
                  dataKey="teletravail"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTeletravail)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart - Répartition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Répartition {currentYear}</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`${value} jours`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exports Table */}
        <RecentExportsTable />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/calendar"
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-violet-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <Calendar className="w-6 h-6 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">Modifier planning</span>
            </Link>
            <Link
              href="/export"
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <FileDown className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">Exporter ICS</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
