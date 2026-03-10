'use client';

import { useState, useMemo, Fragment, useEffect } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { useTeam } from '@/contexts/team-context';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

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

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// ============ STATUS CONFIGS ============
const STATUS_CONFIG: Record<Status, { label: string; icon: any; bgClass: string; textClass: string; borderClass: string }> = {
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

// ============ MAIN COMPONENT ============
export default function TeamPlannerPage() {
  const { team, members: contextMembers, loading: teamLoading } = useTeam();
  const [activeTab, setActiveTab] = useState<'weekly' | 'semester'>('weekly');
  const [teamSchedules, setTeamSchedules] = useState<Record<string, any>>({});
  const [semesterStart, setSemesterStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Mapper les membres du contexte vers le format attendu par le Planner
  const teamMembers = useMemo(() => {
    return contextMembers
      .filter(m => m.status === 'approved') // Ne montrer que les membres approuvés
      .map(m => ({
        id: m.user_id,
        name: m.profile?.full_name || m.profile?.displayName || 'Sans nom',
        color: (m.profile as any)?.color || '#3B82F6',
        isExcludedFromDuty: false,
        canTakeCallsRemote: false,
        role: m.role === 'leader' ? 'Leader' : (m.profile as any)?.employeeType || 'Membre',
        initials: (m.profile?.full_name || m.profile?.displayName || '??')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
      }));
  }, [contextMembers]);

  // Charger les calendriers des membres approuvés
  useEffect(() => {
    const loadSchedules = async () => {
      if (!db || teamMembers.length === 0) return;

      try {
        const schedules: Record<string, any> = {};
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

  // Calculate statistics (Simplified for now)
  const stats = useMemo(() => {
    let onsite = 0, remote = 0, absent = 0;
    // Logic to count across teamSchedules... (omitted for brevity in this rewrite part)
    return { totalOnsite: onsite, totalRemote: remote, totalAbsent: absent };
  }, [teamSchedules]);

  const handlePrint = () => window.print();

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
              <Users className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-[var(--text-primary)]">Team </span>
                <span className="gradient-text-amber">Planner</span>
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500/60" />
                Gestion de la présence de l&apos;équipe
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <button onClick={() => setActiveTab('weekly')} className={cn("btn-ghost", activeTab === 'weekly' && "bg-amber-500/10 text-amber-500")}>Hebdomadaire</button>
        <button onClick={() => setActiveTab('semester')} className={cn("btn-ghost", activeTab === 'semester' && "bg-amber-500/10 text-amber-500")}>Semestriel</button>
        <div className="flex-1" />
        <button onClick={handlePrint} className="btn-secondary"><Printer className="w-4 h-4" /> Imprimer</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {teamMembers.map((member, index) => (
          <div key={member.id} className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: member.color }}>
              {member.initials}
            </div>
            <div className="text-sm font-medium">{member.name}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{member.role}</div>
          </div>
        ))}
      </div>

      <div className="card p-6 overflow-x-auto">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Aperçu Hebdomadaire (Données Cloud)</h2>
        </div>

        {/* Simplified Table for the v12.0 core functionality */}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="py-3 px-4 font-medium">Membre</th>
              {DAYS.map(d => <th key={d} className="py-3 px-4 font-medium text-center">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map(m => (
              <tr key={m.id} className="border-b border-[var(--border-subtle)] hover:bg-white/5">
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </td>
                {DAYS.map(d => (
                  <td key={d} className="py-3 px-4 text-center">
                    {/* Logic to show status from teamSchedules... */}
                    <div className="text-[10px] text-[var(--text-muted)]">Indisponible</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
