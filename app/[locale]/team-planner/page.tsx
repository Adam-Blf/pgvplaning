'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

import {
  Printer,
  Calendar,
  Users,
  Building2,
  Home,
  Plane,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  GraduationCap,
  Briefcase,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeam } from '@/contexts/team-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

// ============ STATUS MAPPING ============
const STATUS_MAP: Record<string, { label: string; short: string; printClass: string; screenClass: string }> = {
  work:      { label: 'Bureau',       short: 'B',  printClass: 'print-status-work',    screenClass: 'bg-blue-500 text-white' },
  remote:    { label: 'Télétravail',  short: 'TT', printClass: 'print-status-remote',  screenClass: 'bg-emerald-500 text-white' },
  school:    { label: 'Formation',    short: 'F',  printClass: 'print-status-school',  screenClass: 'bg-amber-500 text-white' },
  trainer:   { label: 'Formateur',    short: 'FR', printClass: 'print-status-trainer', screenClass: 'bg-violet-500 text-white' },
  leave:     { label: 'Congé',        short: 'CP', printClass: 'print-status-leave',   screenClass: 'bg-rose-500 text-white' },
  sick:      { label: 'Maladie',      short: 'M',  printClass: 'print-status-sick',    screenClass: 'bg-red-500 text-white' },
  holiday:   { label: 'Férié',        short: 'JF', printClass: 'print-status-holiday', screenClass: 'bg-gray-500 text-white' },
};

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_NAMES_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

interface MemberRow {
  id: string;
  name: string;
  color: string;
  initials: string;
  role: string;
}

export default function TeamPlannerPage() {
  const { team, members: contextMembers, loading: teamLoading } = useTeam();
  const [teamSchedules, setTeamSchedules] = useState<Record<string, Record<string, any>>>({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const teamMembers: MemberRow[] = useMemo(() => {
    return contextMembers
      .filter(m => m.status === 'approved')
      .map(m => ({
        id: m.user_id,
        name: m.profile?.full_name || m.profile?.displayName || m.profile?.first_name && m.profile?.last_name
          ? `${m.profile?.first_name || ''} ${m.profile?.last_name || ''}`.trim()
          : 'Sans nom',
        color: (m.profile as any)?.color || '#3B82F6',
        initials: (m.profile?.full_name || m.profile?.displayName || '??')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        role: m.role === 'leader' ? 'Leader' : m.role === 'moderator' ? 'Modérateur' : 'Membre',
      }));
  }, [contextMembers]);

  // Load schedules for all members
  useEffect(() => {
    const loadSchedules = async () => {
      if (!db || teamMembers.length === 0) return;
      try {
        const schedules: Record<string, Record<string, any>> = {};
        for (const m of teamMembers) {
          const calRef = collection(db, 'calendars');
          const q = query(calRef, where('userId', '==', m.id));
          const calSnap = await getDocs(q);
          if (!calSnap.empty) {
            schedules[m.id] = calSnap.docs[0].data().data || {};
          }
        }
        setTeamSchedules(schedules);
      } catch (error) {
        console.error("Error loading schedules:", error);
      }
    };
    loadSchedules();
  }, [teamMembers]);

  // Days in current month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return {
        day: i + 1,
        dayOfWeek: date.getDay(), // 0=Sun, 6=Sat
        dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      };
    });
  }, [currentMonth]);

  const getStatus = useCallback((memberId: string, dateKey: string) => {
    const memberData = teamSchedules[memberId];
    if (!memberData) return null;
    const dayData = memberData[dateKey];
    if (!dayData) return null;
    // dayData can be a string (status) or an object with .status
    const status = typeof dayData === 'string' ? dayData : dayData.status;
    return status || null;
  }, [teamSchedules]);

  const handlePrint = () => window.print();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthLabel = `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* ===== SCREEN HEADER (hidden on print) ===== */}
      <div className="print:hidden animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
              <Users className="w-8 h-8 text-[var(--blueprint-500)]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-[var(--text-primary)]">Team </span>
                <span className="gradient-text-amber">Planner</span>
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--blueprint-500)]/60" />
                Planning mensuel de l&apos;équipe — {teamMembers.length} membres
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-1">
              <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors" aria-label="Mois précédent">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-sm min-w-[160px] text-center">{monthLabel}</span>
              <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--bg-overlay)] transition-colors" aria-label="Mois suivant">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button type="button" onClick={handlePrint} className="btn-secondary" aria-label="Imprimer">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== SCREEN LEGEND (hidden on print) ===== */}
      <div className="print:hidden flex flex-wrap gap-3 animate-fade-up opacity-0" style={{ animationDelay: '50ms' }}>
        {Object.entries(STATUS_MAP).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className={cn('w-4 h-4 rounded', cfg.screenClass)} />
            <span className="text-[var(--text-secondary)]">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* ===== PRINT HEADER (hidden on screen) ===== */}
      <div className="hidden print:block print-header">
        <h1>{team?.name || 'Équipe'} — {monthLabel}</h1>
        <span className="print-date">Imprimé le {new Date().toLocaleDateString('fr-FR')}</span>
      </div>

      {/* ===== MONTHLY GRID TABLE ===== */}
      <div className="overflow-x-auto animate-fade-up opacity-0" style={{ animationDelay: '100ms' }}>
        <table className="w-full text-left print-table" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[var(--bg-surface)] py-2 px-3 text-left font-semibold text-xs min-w-[130px] border-b border-r border-[var(--border-subtle)] print:bg-gray-100">
                Membre
              </th>
              {daysInMonth.map(d => (
                <th
                  key={d.day}
                  className={cn(
                    'py-1 px-0.5 text-center font-medium border-b border-[var(--border-subtle)] min-w-[28px]',
                    d.isWeekend ? 'bg-[var(--bg-overlay)]/50 text-[var(--text-muted)] weekend-col' : 'text-[var(--text-secondary)]',
                  )}
                >
                  <div className="text-[9px] leading-none opacity-60">{DAY_NAMES_SHORT[d.dayOfWeek]}</div>
                  <div className="text-[11px] font-bold tabular-nums">{d.day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b border-[var(--border-subtle)] hover:bg-white/[0.02] transition-colors">
                <td className="sticky left-0 z-10 bg-[var(--bg-surface)] py-1.5 px-3 border-r border-[var(--border-subtle)] member-name">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 print:w-4 print:h-4 print:text-[7px]"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.initials}
                    </div>
                    <span className="text-xs font-medium truncate max-w-[100px]">{member.name}</span>
                  </div>
                </td>
                {daysInMonth.map(d => {
                  const status = d.isWeekend ? null : getStatus(member.id, d.dateKey);
                  const cfg = status ? STATUS_MAP[status] : null;
                  return (
                    <td
                      key={d.day}
                      className={cn(
                        'py-1 px-0 text-center border-[var(--border-subtle)]',
                        d.isWeekend && 'bg-[var(--bg-overlay)]/30 weekend-col',
                        cfg && cfg.printClass,
                      )}
                    >
                      {cfg ? (
                        <div className={cn(
                          'mx-auto w-6 h-5 rounded-sm flex items-center justify-center text-[8px] font-bold leading-none',
                          cfg.screenClass,
                          'print:w-full print:h-full print:rounded-none',
                        )}>
                          {cfg.short}
                        </div>
                      ) : d.isWeekend ? (
                        <span className="text-[8px] text-[var(--text-muted)]/30 print:text-gray-300">·</span>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PRINT LEGEND (hidden on screen) ===== */}
      <div className="hidden print:block print-legend">
        {Object.entries(STATUS_MAP).map(([key, cfg]) => (
          <span key={key}>
            <span className={cn('dot', cfg.printClass)} />
            {cfg.short} = {cfg.label}
          </span>
        ))}
      </div>

      {/* ===== SCREEN STATS (hidden on print) ===== */}
      <div className="print:hidden grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up opacity-0" style={{ animationDelay: '150ms' }}>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-lg font-bold tabular-nums">{teamMembers.length}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Membres</div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-lg font-bold tabular-nums">{daysInMonth.filter(d => !d.isWeekend).length}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Jours ouvrés</div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-lg font-bold tabular-nums">{daysInMonth.length}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Jours total</div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <div>
            <div className="text-lg font-bold tabular-nums">{Object.keys(teamSchedules).length}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Calendriers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
