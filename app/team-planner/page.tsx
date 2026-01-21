'use client';

import { useState, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  AlertTriangle,
  Printer,
  Calendar,
  Users,
  Headphones,
  Building2,
  Home,
  Plane,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============ TYPES ============
type Status = 'ONSITE' | 'REMOTE' | 'ABSENT';
type HalfDay = 'AM' | 'PM';

interface TeamMember {
  id: string;
  name: string;
  color: string;
  isExcludedFromDuty: boolean;
  canTakeCallsRemote: boolean;
  role?: string;
  initials?: string;
}

interface WeeklySchedule {
  [memberId: string]: {
    [day: string]: {
      AM: Status;
      PM: Status;
    };
  };
}

interface AbsencePeriod {
  memberId: string;
  startDate: string;
  endDate: string;
}

// ============ MOCK DATA ============
const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sophie Martin', color: '#10B981', isExcludedFromDuty: false, canTakeCallsRemote: false, role: 'Manager', initials: 'SM' },
  { id: '2', name: 'Marc Dupont', color: '#3B82F6', isExcludedFromDuty: false, canTakeCallsRemote: true, role: 'Developer', initials: 'MD' },
  { id: '3', name: 'Julie Bernard', color: '#8B5CF6', isExcludedFromDuty: false, canTakeCallsRemote: false, role: 'Designer', initials: 'JB' },
  { id: '4', name: 'Thomas Petit', color: '#F59E0B', isExcludedFromDuty: false, canTakeCallsRemote: true, role: 'Developer', initials: 'TP' },
  { id: '5', name: 'Léa Moreau', color: '#EC4899', isExcludedFromDuty: true, canTakeCallsRemote: false, role: 'Analyst', initials: 'LM' },
  { id: '6', name: 'Antoine Roux', color: '#06B6D4', isExcludedFromDuty: false, canTakeCallsRemote: false, role: 'Support', initials: 'AR' },
];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const INITIAL_SCHEDULE: WeeklySchedule = {
  '1': { Lundi: { AM: 'ONSITE', PM: 'ONSITE' }, Mardi: { AM: 'ONSITE', PM: 'ONSITE' }, Mercredi: { AM: 'ONSITE', PM: 'ONSITE' }, Jeudi: { AM: 'ONSITE', PM: 'ONSITE' }, Vendredi: { AM: 'ONSITE', PM: 'ONSITE' } },
  '2': { Lundi: { AM: 'REMOTE', PM: 'REMOTE' }, Mardi: { AM: 'ONSITE', PM: 'ONSITE' }, Mercredi: { AM: 'REMOTE', PM: 'REMOTE' }, Jeudi: { AM: 'ONSITE', PM: 'ONSITE' }, Vendredi: { AM: 'REMOTE', PM: 'REMOTE' } },
  '3': { Lundi: { AM: 'ONSITE', PM: 'ONSITE' }, Mardi: { AM: 'ABSENT', PM: 'ABSENT' }, Mercredi: { AM: 'ONSITE', PM: 'ONSITE' }, Jeudi: { AM: 'ONSITE', PM: 'ONSITE' }, Vendredi: { AM: 'ONSITE', PM: 'ABSENT' } },
  '4': { Lundi: { AM: 'ONSITE', PM: 'REMOTE' }, Mardi: { AM: 'ONSITE', PM: 'ONSITE' }, Mercredi: { AM: 'ABSENT', PM: 'ABSENT' }, Jeudi: { AM: 'REMOTE', PM: 'REMOTE' }, Vendredi: { AM: 'ONSITE', PM: 'ONSITE' } },
  '5': { Lundi: { AM: 'ONSITE', PM: 'ONSITE' }, Mardi: { AM: 'ONSITE', PM: 'ONSITE' }, Mercredi: { AM: 'ONSITE', PM: 'ONSITE' }, Jeudi: { AM: 'ABSENT', PM: 'ABSENT' }, Vendredi: { AM: 'ONSITE', PM: 'ONSITE' } },
  '6': { Lundi: { AM: 'ABSENT', PM: 'ABSENT' }, Mardi: { AM: 'ONSITE', PM: 'ONSITE' }, Mercredi: { AM: 'ONSITE', PM: 'ONSITE' }, Jeudi: { AM: 'ONSITE', PM: 'ONSITE' }, Vendredi: { AM: 'ABSENT', PM: 'ABSENT' } },
};

const ABSENCES: AbsencePeriod[] = [
  { memberId: '1', startDate: '2026-02-16', endDate: '2026-02-20' },
  { memberId: '2', startDate: '2026-03-02', endDate: '2026-03-13' },
  { memberId: '3', startDate: '2026-04-06', endDate: '2026-04-17' },
  { memberId: '4', startDate: '2026-02-23', endDate: '2026-02-27' },
  { memberId: '5', startDate: '2026-05-11', endDate: '2026-05-22' },
  { memberId: '6', startDate: '2026-03-16', endDate: '2026-03-20' },
  { memberId: '1', startDate: '2026-06-01', endDate: '2026-06-12' },
  { memberId: '2', startDate: '2026-05-04', endDate: '2026-05-08' },
];

// ============ STATUS CONFIGS ============
const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; bgClass: string; textClass: string; borderClass: string }> = {
  ONSITE: { label: 'Site', icon: Building2, bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/20' },
  REMOTE: { label: 'TT', icon: Home, bgClass: 'bg-purple-500/10', textClass: 'text-purple-400', borderClass: 'border-purple-500/20' },
  ABSENT: { label: 'Absent', icon: Plane, bgClass: 'bg-rose-500/10', textClass: 'text-rose-400', borderClass: 'border-rose-500/20' },
};

// ============ ANIMATION VARIANTS ============
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

// ============ MAIN COMPONENT ============
export default function TeamPlannerPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'semester'>('weekly');
  const [schedule, setSchedule] = useState<WeeklySchedule>(INITIAL_SCHEDULE);
  const [semesterStart, setSemesterStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Calculate statistics
  const stats = useMemo(() => {
    let totalOnsite = 0;
    let totalRemote = 0;
    let totalAbsent = 0;

    Object.values(schedule).forEach(memberSchedule => {
      Object.values(memberSchedule).forEach(daySchedule => {
        if (daySchedule.AM === 'ONSITE') totalOnsite++;
        if (daySchedule.PM === 'ONSITE') totalOnsite++;
        if (daySchedule.AM === 'REMOTE') totalRemote++;
        if (daySchedule.PM === 'REMOTE') totalRemote++;
        if (daySchedule.AM === 'ABSENT') totalAbsent++;
        if (daySchedule.PM === 'ABSENT') totalAbsent++;
      });
    });

    return { totalOnsite, totalRemote, totalAbsent };
  }, [schedule]);

  const updateStatus = (memberId: string, day: string, halfDay: HalfDay, status: Status) => {
    setSchedule(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [day]: {
          ...prev[memberId][day],
          [halfDay]: status,
        },
      },
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="relative">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title and description */}
          <div className="flex items-start gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Users className="w-8 h-8 text-amber-500" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-[var(--text-primary)]">Team </span>
                <span className="gradient-text-amber">Planner</span>
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500/60" />
                Gestion de la presence et permanence telephonique
              </p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="flex flex-wrap gap-3 print:hidden">
            <StatsCard
              icon={Building2}
              label="Sur site"
              value={stats.totalOnsite}
              color="emerald"
            />
            <StatsCard
              icon={Home}
              label="Teletravail"
              value={stats.totalRemote}
              color="purple"
            />
            <StatsCard
              icon={Plane}
              label="Absents"
              value={stats.totalAbsent}
              color="rose"
            />
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <TabButton
            active={activeTab === 'weekly'}
            onClick={() => setActiveTab('weekly')}
            icon={Phone}
            label="Hebdomadaire"
            sublabel="Permanence"
          />
          <TabButton
            active={activeTab === 'semester'}
            onClick={() => setActiveTab('semester')}
            icon={Calendar}
            label="Semestriel"
            sublabel="Previsions"
          />
        </div>

        <motion.button
          onClick={handlePrint}
          className="btn-secondary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </motion.button>
      </motion.div>

      {/* Team Members Overview */}
      <motion.div variants={itemVariants} className="print:hidden">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Equipe</h2>
          <span className="badge-amber">{TEAM_MEMBERS.length} membres</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TEAM_MEMBERS.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'weekly' ? (
          <motion.div
            key="weekly"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeInVariants}
          >
            <WeeklyView
              schedule={schedule}
              onUpdateStatus={updateStatus}
            />
          </motion.div>
        ) : (
          <motion.div
            key="semester"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeInVariants}
          >
            <SemesterView
              absences={ABSENCES}
              startDate={semesterStart}
              onNavigate={(delta) => {
                setSemesterStart(prev => {
                  const next = new Date(prev);
                  next.setMonth(next.getMonth() + delta);
                  return next;
                });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ STATS CARD ============
function StatsCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'emerald' | 'purple' | 'rose' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl border',
        colorClasses[color]
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <Icon className="w-4 h-4" />
      <div className="flex flex-col">
        <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
    </motion.div>
  );
}

// ============ TAB BUTTON ============
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  sublabel
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  sublabel: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-3',
        active
          ? 'text-black'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'
      )}
      whileHover={!active ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          className="absolute inset-0 bg-amber-500 rounded-lg"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
        <span className="hidden md:inline text-xs opacity-70">({sublabel})</span>
      </span>
    </motion.button>
  );
}

// ============ MEMBER CARD ============
function MemberCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <motion.div
      className="card-interactive p-4 flex flex-col items-center gap-3 group cursor-default"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
          style={{ backgroundColor: member.color }}
        >
          {member.initials}
        </div>
        {member.canTakeCallsRemote && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center border-2 border-[var(--bg-surface)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Headphones className="w-3 h-3 text-white" />
          </motion.div>
        )}
        {member.isExcludedFromDuty && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center border-2 border-[var(--bg-surface)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Shield className="w-3 h-3 text-black" />
          </motion.div>
        )}
      </div>

      {/* Name and role */}
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-full">
          {member.name.split(' ')[0]}
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">{member.role}</p>
      </div>
    </motion.div>
  );
}

// ============ WEEKLY VIEW ============
function WeeklyView({
  schedule,
  onUpdateStatus
}: {
  schedule: WeeklySchedule;
  onUpdateStatus: (memberId: string, day: string, halfDay: HalfDay, status: Status) => void;
}) {
  // Calculate duty counts per half-day
  const dutyCounts = useMemo(() => {
    const counts: Record<string, { AM: number; PM: number; remoteWithCalls: { AM: number; PM: number } }> = {};

    DAYS.forEach(day => {
      counts[day] = { AM: 0, PM: 0, remoteWithCalls: { AM: 0, PM: 0 } };

      TEAM_MEMBERS.forEach(member => {
        const daySchedule = schedule[member.id]?.[day];
        if (!daySchedule) return;

        // AM
        if (daySchedule.AM === 'ONSITE' && !member.isExcludedFromDuty) {
          counts[day].AM++;
        }
        if (daySchedule.AM === 'REMOTE' && member.canTakeCallsRemote) {
          counts[day].remoteWithCalls.AM++;
        }

        // PM
        if (daySchedule.PM === 'ONSITE' && !member.isExcludedFromDuty) {
          counts[day].PM++;
        }
        if (daySchedule.PM === 'REMOTE' && member.canTakeCallsRemote) {
          counts[day].remoteWithCalls.PM++;
        }
      });
    });

    return counts;
  }, [schedule]);

  return (
    <motion.div
      className="card p-6 overflow-x-auto"
      variants={itemVariants}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Planning Hebdomadaire</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Cliquez sur une cellule pour changer le statut</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-tl-xl sticky left-0 z-10">
                <span className="text-[var(--text-secondary)] text-sm font-medium">Collaborateur</span>
              </th>
              {DAYS.map((day, idx) => (
                <th
                  key={day}
                  colSpan={2}
                  className={cn(
                    'text-center p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]',
                    idx === DAYS.length - 1 && 'rounded-tr-xl'
                  )}
                >
                  <span className="text-[var(--text-primary)] font-semibold">{day}</span>
                </th>
              ))}
            </tr>
            <tr>
              <th className="p-2 border-b border-[var(--border-subtle)] sticky left-0 bg-[var(--bg-surface)] z-10"></th>
              {DAYS.map(day => (
                <Fragment key={day}>
                  <th className="text-center p-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
                    Matin
                  </th>
                  <th className="text-center p-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
                    Apres-midi
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM_MEMBERS.map((member, memberIdx) => (
              <motion.tr
                key={member.id}
                className="hover:bg-[var(--bg-elevated)]/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: memberIdx * 0.03 }}
              >
                <td className="p-3 border-b border-[var(--border-subtle)] sticky left-0 bg-[var(--bg-surface)] z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text-primary)] text-sm">
                        {member.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {member.isExcludedFromDuty && (
                          <span className="badge text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/20">
                            <Shield className="w-2.5 h-2.5 mr-0.5" />
                            Exclu
                          </span>
                        )}
                        {member.canTakeCallsRemote && (
                          <span className="badge text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border-purple-500/20">
                            <Headphones className="w-2.5 h-2.5 mr-0.5" />
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                {DAYS.map(day => {
                  const daySchedule = schedule[member.id]?.[day];
                  return (
                    <Fragment key={day}>
                      <td className="p-1.5 border-b border-[var(--border-subtle)]">
                        <StatusCell
                          status={daySchedule?.AM || 'ONSITE'}
                          member={member}
                          onChange={(status) => onUpdateStatus(member.id, day, 'AM', status)}
                        />
                      </td>
                      <td className="p-1.5 border-b border-[var(--border-subtle)]">
                        <StatusCell
                          status={daySchedule?.PM || 'ONSITE'}
                          member={member}
                          onChange={(status) => onUpdateStatus(member.id, day, 'PM', status)}
                        />
                      </td>
                    </Fragment>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[var(--bg-elevated)]">
              <td className="p-3 font-semibold text-[var(--text-primary)] sticky left-0 bg-[var(--bg-elevated)] z-10 rounded-bl-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Phone className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm">Permanence Site</span>
                </div>
              </td>
              {DAYS.map((day, idx) => (
                <Fragment key={day}>
                  <td className="p-2 text-center">
                    <DutyCounter
                      count={dutyCounts[day].AM}
                      remoteCount={dutyCounts[day].remoteWithCalls.AM}
                    />
                  </td>
                  <td className={cn(
                    'p-2 text-center',
                    idx === DAYS.length - 1 && 'rounded-br-xl'
                  )}>
                    <DutyCounter
                      count={dutyCounts[day].PM}
                      remoteCount={dutyCounts[day].remoteWithCalls.PM}
                    />
                  </td>
                </Fragment>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <motion.div
        className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-4 print:mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-sm text-[var(--text-tertiary)] mr-2">Legende :</span>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <div key={status} className="flex items-center gap-2 text-sm">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center border',
                config.bgClass,
                config.borderClass
              )}>
                <Icon className={cn('w-3.5 h-3.5', config.textClass)} />
              </div>
              <span className="text-[var(--text-secondary)]">{config.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Headphones className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-[var(--text-secondary)]">TT + Appels</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============ STATUS CELL ============
function StatusCell({
  status,
  member,
  onChange
}: {
  status: Status;
  member: TeamMember;
  onChange: (status: Status) => void;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const showHeadphones = status === 'REMOTE' && member.canTakeCallsRemote;

  const cycleStatus = () => {
    const statuses: Status[] = ['ONSITE', 'REMOTE', 'ABSENT'];
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onChange(statuses[nextIndex]);
  };

  return (
    <motion.button
      onClick={cycleStatus}
      className={cn(
        'w-full p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all border',
        config.bgClass,
        config.borderClass,
        'hover:scale-105 active:scale-95 print:hover:scale-100'
      )}
      title={`${config.label} - Cliquer pour changer`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className={cn('w-4 h-4', config.textClass)} />
      {showHeadphones && (
        <Headphones className="w-3 h-3 text-purple-400" />
      )}
    </motion.button>
  );
}

// ============ DUTY COUNTER ============
function DutyCounter({ count, remoteCount }: { count: number; remoteCount: number }) {
  const isCritical = count <= 1;

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={cn(
          'px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1.5 border',
          isCritical
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        )}
        animate={isCritical ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isCritical ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {isCritical && <AlertTriangle className="w-3 h-3" />}
        {count}
      </motion.div>
      {remoteCount > 0 && (
        <motion.div
          className="text-xs text-purple-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Headphones className="w-3 h-3" />
          +{remoteCount}
        </motion.div>
      )}
    </div>
  );
}

// ============ SEMESTER VIEW ============
function SemesterView({
  absences,
  startDate,
  onNavigate
}: {
  absences: AbsencePeriod[];
  startDate: Date;
  onNavigate: (delta: number) => void;
}) {
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      result.push(date);
    }
    return result;
  }, [startDate]);

  const MONTH_NAMES = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];

  return (
    <div className="relative">
      {/* Header with navigation and legend */}
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
        variants={itemVariants}
      >
        {/* Navigation */}
        <div className="flex items-center gap-3 print:hidden">
          <motion.button
            onClick={() => onNavigate(-6)}
            className="btn-secondary"
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">6 mois</span>
          </motion.button>
          <div className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {MONTH_NAMES[startDate.getMonth()]} {startDate.getFullYear()}
            </span>
            <span className="text-[var(--text-tertiary)]"> - </span>
            <span className="font-semibold text-[var(--text-primary)]">
              {MONTH_NAMES[months[5].getMonth()]} {months[5].getFullYear()}
            </span>
          </div>
          <motion.button
            onClick={() => onNavigate(6)}
            className="btn-secondary"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="hidden sm:inline">6 mois</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--text-tertiary)] mr-1">Membres :</span>
          {TEAM_MEMBERS.map(member => (
            <motion.div
              key={member.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-xs text-[var(--text-secondary)]">{member.name.split(' ')[0]}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        className="card p-6"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Vue Semestrielle</h2>
            <p className="text-sm text-[var(--text-tertiary)]">Visualisez les absences sur 6 mois</p>
          </div>
        </div>

        <div className="space-y-6">
          {months.map((month, idx) => (
            <motion.div
              key={month.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <MonthRow
                month={month}
                absences={absences}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============ MONTH ROW ============
function MonthRow({ month, absences }: { month: Date; absences: AbsencePeriod[] }) {
  const MONTH_NAMES = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a day is a weekend
  const isWeekend = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  // Get absences for this month
  const getAbsencesForDay = (day: number) => {
    const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return absences.filter(absence => {
      return dateStr >= absence.startDate && dateStr <= absence.endDate;
    });
  };

  return (
    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-amber-500" />
        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
      </h3>
      <div className="flex gap-px overflow-x-auto scrollbar-hide pb-2">
        {days.map(day => {
          const weekend = isWeekend(day);
          const dayAbsences = getAbsencesForDay(day);

          return (
            <motion.div
              key={day}
              className={cn(
                'flex-1 min-w-[24px] text-center',
                weekend && 'opacity-30'
              )}
              whileHover={{ scale: 1.1 }}
            >
              <div className={cn(
                'text-xs mb-1 font-medium',
                weekend ? 'text-[var(--text-muted)]' : 'text-[var(--text-tertiary)]'
              )}>
                {day}
              </div>
              <div className="h-20 flex flex-col gap-px rounded-lg overflow-hidden bg-[var(--bg-surface)]">
                {TEAM_MEMBERS.map(member => {
                  const hasAbsence = dayAbsences.some(a => a.memberId === member.id);
                  return (
                    <motion.div
                      key={member.id}
                      className={cn(
                        'flex-1 transition-all',
                        hasAbsence ? '' : 'bg-[var(--bg-overlay)]'
                      )}
                      style={hasAbsence ? { backgroundColor: member.color } : undefined}
                      title={hasAbsence ? `${member.name} - Absence` : member.name}
                      whileHover={{ opacity: 0.8 }}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
