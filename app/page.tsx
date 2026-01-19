'use client';

import { useMemo } from 'react';
import {
  Briefcase,
  Home,
  GraduationCap,
  Palmtree,
  ArrowRight,
  Calendar,
  FileDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import { cn } from '@/lib/utils';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import Link from 'next/link';

const statusConfig = {
  work: {
    label: 'Bureau',
    icon: Briefcase,
    colorClass: 'fr-tag--blue',
    chartColor: 'var(--bleu-france)',
  },
  remote: {
    label: 'Télétravail',
    icon: Home,
    colorClass: 'fr-tag--green',
    chartColor: 'var(--success)',
  },
  school: {
    label: 'Formation',
    icon: GraduationCap,
    colorClass: 'fr-tag--orange',
    chartColor: 'var(--warning)',
  },
  leave: {
    label: 'Congés',
    icon: Palmtree,
    colorClass: 'fr-tag--red',
    chartColor: 'var(--error)',
  },
};

// Composant Card KPI style Service Public
function KPICard({
  title,
  value,
  percentage,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number;
  percentage: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="fr-card fr-card--shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('fr-tag', colorClass, 'p-2')}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[var(--text-mention)] text-sm">{title}</p>
            <p className="text-2xl font-bold text-[var(--text-title)]">
              {value}
              <span className="text-base text-[var(--text-mention)] font-normal ml-1">jours</span>
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-[var(--text-mention)]">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// Composant étape pour démarrer
function StepCard({
  number,
  title,
  description,
  href,
  icon: Icon,
  completed = false,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  completed?: boolean;
}) {
  return (
    <Link href={href} className="block no-underline group">
      <div className="fr-card fr-card--shadow hover:border-[var(--bleu-france)] transition-colors">
        <div className="flex items-start gap-4">
          <div className={cn(
            'fr-stepper__number flex-shrink-0',
            completed ? 'bg-[var(--success)] text-white' : 'bg-[var(--bleu-france)] text-white'
          )}>
            {completed ? <CheckCircle2 className="w-4 h-4" /> : number}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-5 h-5 text-[var(--bleu-france)]" />
              <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                {title}
              </h3>
            </div>
            <p className="text-sm text-[var(--text-mention)]">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoaded } = useCalendarData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const stats = useCalendarStats(data, currentYear);

  const pieData = useMemo(
    () => [
      { name: 'Bureau', value: stats.work, color: '#000091' },
      { name: 'Télétravail', value: stats.remote, color: '#18753c' },
      { name: 'Formation', value: stats.school, color: '#b34000' },
      { name: 'Congés', value: stats.leave, color: '#ce0500' },
    ],
    [stats]
  );

  const barData = useMemo(() => [
    { name: 'Bureau', value: stats.work, fill: '#000091' },
    { name: 'Télétravail', value: stats.remote, fill: '#18753c' },
    { name: 'Formation', value: stats.school, fill: '#b34000' },
    { name: 'Congés', value: stats.leave, fill: '#ce0500' },
  ], [stats]);

  // Calculer si l'utilisateur a commencé à remplir son calendrier
  const hasStarted = stats.work + stats.remote + stats.school + stats.leave > 0;

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Message d'accueil */}
      <div className="fr-alert fr-alert--info">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Bienvenue sur PGV Planning</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Ce service vous permet de planifier vos journées de travail, télétravail, formations et congés,
              puis d'exporter votre planning au format ICS compatible avec tous les calendriers (Outlook, Google Calendar, Apple Calendar).
            </p>
          </div>
        </div>
      </div>

      {/* Étapes pour démarrer */}
      {!hasStarted && (
        <section>
          <h2 className="text-xl font-bold text-[var(--text-title)] mb-4">Comment utiliser ce service ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              number={1}
              title="Remplir le calendrier"
              description="Sélectionnez vos jours et leur type (bureau, télétravail, formation, congés)"
              href="/calendar"
              icon={Calendar}
            />
            <StepCard
              number={2}
              title="Vérifier les statistiques"
              description="Consultez le récapitulatif de vos jours par catégorie"
              href="/analytics"
              icon={Briefcase}
            />
            <StepCard
              number={3}
              title="Exporter le fichier ICS"
              description="Téléchargez le fichier à importer dans votre calendrier"
              href="/exports"
              icon={FileDown}
            />
          </div>
        </section>
      )}

      {/* Statistiques */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-title)] mb-4">
          Récapitulatif de l'année {currentYear}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
            const config = statusConfig[key];
            return (
              <KPICard
                key={key}
                title={config.label}
                value={stats[key]}
                percentage={stats.percentages[key]}
                icon={config.icon}
                colorClass={config.colorClass}
              />
            );
          })}
        </div>
      </section>

      {/* Graphiques */}
      {hasStarted && (
        <section>
          <h2 className="text-xl font-bold text-[var(--text-title)] mb-4">
            Visualisation
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="fr-card fr-card--shadow">
              <h3 className="font-bold text-[var(--text-title)] mb-4">
                Répartition par catégorie
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis type="number" stroke="var(--text-mention)" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--text-mention)"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-alt)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '4px',
                        color: 'var(--text-default)',
                      }}
                      formatter={(value) => [`${value} jours`, '']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="fr-card fr-card--shadow">
              <h3 className="font-bold text-[var(--text-title)] mb-4">
                Répartition en pourcentage
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background-alt)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '4px',
                        color: 'var(--text-default)',
                      }}
                      formatter={(value) => [`${value} jours`, '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Actions rapides */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-title)] mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/calendar" className="no-underline">
            <div className="fr-card fr-card--shadow hover:border-[var(--bleu-france)] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--info-bg)] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[var(--bleu-france)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                    Modifier le calendrier
                  </h3>
                  <p className="text-sm text-[var(--text-mention)]">
                    Planifiez vos journées
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors" />
              </div>
            </div>
          </Link>
          <Link href="/exports" className="no-underline">
            <div className="fr-card fr-card--shadow hover:border-[var(--bleu-france)] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-[var(--success)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                    Exporter en fichier ICS
                  </h3>
                  <p className="text-sm text-[var(--text-mention)]">
                    Téléchargez votre planning
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Information sur les données */}
      <section className="fr-alert fr-alert--warning">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Stockage local</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Vos données de planning sont stockées localement dans votre navigateur.
              Elles ne sont pas transmises à un serveur et restent privées.
              Pensez à exporter régulièrement votre planning pour le sauvegarder.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
