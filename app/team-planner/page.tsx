'use client';

import { useState, useMemo } from 'react';
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
  ChevronRight
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
  { id: '1', name: 'Sophie Martin', color: '#10B981', isExcludedFromDuty: false, canTakeCallsRemote: false },
  { id: '2', name: 'Marc Dupont', color: '#3B82F6', isExcludedFromDuty: false, canTakeCallsRemote: true },
  { id: '3', name: 'Julie Bernard', color: '#8B5CF6', isExcludedFromDuty: false, canTakeCallsRemote: false },
  { id: '4', name: 'Thomas Petit', color: '#F59E0B', isExcludedFromDuty: false, canTakeCallsRemote: true },
  { id: '5', name: 'Léa Moreau', color: '#EC4899', isExcludedFromDuty: true, canTakeCallsRemote: false },
  { id: '6', name: 'Antoine Roux', color: '#06B6D4', isExcludedFromDuty: false, canTakeCallsRemote: false },
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
const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; bgClass: string; textClass: string }> = {
  ONSITE: { label: 'Site', icon: Building2, bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
  REMOTE: { label: 'TT', icon: Home, bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  ABSENT: { label: 'Absent', icon: Plane, bgClass: 'bg-rose-100', textClass: 'text-rose-700' },
};

// ============ MAIN COMPONENT ============
export default function TeamPlannerPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'semester'>('weekly');
  const [schedule, setSchedule] = useState<WeeklySchedule>(INITIAL_SCHEDULE);
  const [semesterStart, setSemesterStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Users className="w-7 h-7 text-[var(--accent)]" />
            Team Planner
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Gestion de la présence et permanence téléphonique
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn btn-secondary print:hidden"
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 print:hidden">
        <button
          onClick={() => setActiveTab('weekly')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
            activeTab === 'weekly'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          )}
        >
          <Phone className="w-4 h-4" />
          Hebdomadaire (Permanence)
        </button>
        <button
          onClick={() => setActiveTab('semester')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
            activeTab === 'semester'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          )}
        >
          <Calendar className="w-4 h-4" />
          Semestriel (Prévisions)
        </button>
      </div>

      {/* Content */}
      {activeTab === 'weekly' ? (
        <WeeklyView
          schedule={schedule}
          onUpdateStatus={updateStatus}
        />
      ) : (
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
      )}
    </div>
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
    <div className="card overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] rounded-tl-lg">
              Collaborateur
            </th>
            {DAYS.map(day => (
              <th
                key={day}
                colSpan={2}
                className="text-center p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
              >
                {day}
              </th>
            ))}
          </tr>
          <tr>
            <th className="p-2 border-b border-[var(--border-subtle)]"></th>
            {DAYS.map(day => (
              <>
                <th key={`${day}-AM`} className="text-center p-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  Matin
                </th>
                <th key={`${day}-PM`} className="text-center p-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  Après-midi
                </th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEAM_MEMBERS.map(member => (
            <tr key={member.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
              <td className="p-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="font-medium text-[var(--text-primary)]">
                    {member.name}
                  </span>
                  {member.isExcludedFromDuty && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      Exclu perm.
                    </span>
                  )}
                </div>
              </td>
              {DAYS.map(day => {
                const daySchedule = schedule[member.id]?.[day];
                return (
                  <>
                    <td key={`${day}-AM`} className="p-1 border-b border-[var(--border-subtle)]">
                      <StatusCell
                        status={daySchedule?.AM || 'ONSITE'}
                        member={member}
                        onChange={(status) => onUpdateStatus(member.id, day, 'AM', status)}
                      />
                    </td>
                    <td key={`${day}-PM`} className="p-1 border-b border-[var(--border-subtle)]">
                      <StatusCell
                        status={daySchedule?.PM || 'ONSITE'}
                        member={member}
                        onChange={(status) => onUpdateStatus(member.id, day, 'PM', status)}
                      />
                    </td>
                  </>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[var(--bg-secondary)]">
            <td className="p-3 font-semibold text-[var(--text-primary)]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--accent)]" />
                Permanence Site
              </div>
            </td>
            {DAYS.map(day => (
              <>
                <td key={`${day}-AM-count`} className="p-2 text-center">
                  <DutyCounter
                    count={dutyCounts[day].AM}
                    remoteCount={dutyCounts[day].remoteWithCalls.AM}
                  />
                </td>
                <td key={`${day}-PM-count`} className="p-2 text-center">
                  <DutyCounter
                    count={dutyCounts[day].PM}
                    remoteCount={dutyCounts[day].remoteWithCalls.PM}
                  />
                </td>
              </>
            ))}
          </tr>
        </tfoot>
      </table>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-4 print:mt-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <div key={status} className="flex items-center gap-2 text-sm">
              <div className={cn('w-6 h-6 rounded flex items-center justify-center', config.bgClass)}>
                <Icon className={cn('w-3 h-3', config.textClass)} />
              </div>
              <span className="text-[var(--text-secondary)]">{config.label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
            <Headphones className="w-3 h-3 text-purple-700" />
          </div>
          <span className="text-[var(--text-secondary)]">TT + Appels</span>
        </div>
      </div>
    </div>
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
    <button
      onClick={cycleStatus}
      className={cn(
        'w-full p-2 rounded-lg flex items-center justify-center gap-1 transition-all hover:scale-105 print:hover:scale-100',
        config.bgClass
      )}
      title={`${config.label} - Cliquer pour changer`}
    >
      <Icon className={cn('w-4 h-4', config.textClass)} />
      {showHeadphones && (
        <Headphones className="w-3 h-3 text-purple-700" />
      )}
    </button>
  );
}

// ============ DUTY COUNTER ============
function DutyCounter({ count, remoteCount }: { count: number; remoteCount: number }) {
  const isCritical = count <= 1;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        'px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1',
        isCritical
          ? 'bg-red-100 text-red-700 animate-pulse'
          : 'bg-emerald-100 text-emerald-700'
      )}>
        {isCritical && <AlertTriangle className="w-3 h-3" />}
        {count}
      </div>
      {remoteCount > 0 && (
        <div className="text-xs text-purple-600 flex items-center gap-1">
          <Headphones className="w-3 h-3" />
          +{remoteCount}
        </div>
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
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <div className="relative">
      {/* Legend - Fixed top right */}
      <div className="absolute top-0 right-0 card p-4 z-10 print:static print:mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Légende</h3>
        <div className="space-y-2">
          {TEAM_MEMBERS.map(member => (
            <div key={member.id} className="flex items-center gap-2 text-sm">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-[var(--text-secondary)]">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => onNavigate(-6)}
          className="btn btn-secondary"
        >
          <ChevronLeft className="w-4 h-4" />
          6 mois
        </button>
        <span className="font-semibold text-[var(--text-primary)]">
          {MONTH_NAMES[startDate.getMonth()]} {startDate.getFullYear()} - {MONTH_NAMES[months[5].getMonth()]} {months[5].getFullYear()}
        </span>
        <button
          onClick={() => onNavigate(6)}
          className="btn btn-secondary"
        >
          6 mois
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="card mr-52 print:mr-0">
        <div className="space-y-6">
          {months.map(month => (
            <MonthRow
              key={month.toISOString()}
              month={month}
              absences={absences}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MONTH ROW ============
function MonthRow({ month, absences }: { month: Date; absences: AbsencePeriod[] }) {
  const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
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
    <div>
      <h3 className="font-semibold text-[var(--text-primary)] mb-2">
        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
      </h3>
      <div className="flex gap-px">
        {days.map(day => {
          const weekend = isWeekend(day);
          const dayAbsences = getAbsencesForDay(day);

          return (
            <div
              key={day}
              className={cn(
                'flex-1 min-w-[20px] text-center',
                weekend && 'opacity-30'
              )}
            >
              <div className="text-xs text-[var(--text-muted)] mb-1">{day}</div>
              <div className="h-16 flex flex-col gap-px">
                {TEAM_MEMBERS.map(member => {
                  const hasAbsence = dayAbsences.some(a => a.memberId === member.id);
                  return (
                    <div
                      key={member.id}
                      className={cn(
                        'flex-1 rounded-sm transition-all',
                        hasAbsence ? '' : 'bg-[var(--bg-tertiary)]'
                      )}
                      style={hasAbsence ? { backgroundColor: member.color } : undefined}
                      title={hasAbsence ? `${member.name} - Absence` : member.name}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
