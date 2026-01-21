'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Calendar, AlertCircle, Check, Settings, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCalendarData, DayStatus, isDayData, DayData } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

interface AbsencePeriod {
  start: string;
  end: string;
  type: DayStatus;
  label: string;
}

const STATUS_LABELS: Record<DayStatus, string> = {
  WORK: 'Bureau',
  REMOTE: 'Télétravail',
  SCHOOL: 'Formation reçue',
  TRAINER: 'Formateur/Réunion',
  LEAVE: 'Congés',
  HOLIDAY: 'Jour férié',
  OFF: 'Week-end',
};

const STATUS_STYLES: Record<DayStatus, { bg: string; text: string; border: string; dot: string }> = {
  WORK: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-500' },
  REMOTE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  SCHOOL: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  TRAINER: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-500' },
  LEAVE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  HOLIDAY: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  OFF: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-500' },
};

export function NotificationSender() {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [absencePeriods, setAbsencePeriods] = useState<AbsencePeriod[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);
  const { calendarData } = useCalendarData();

  useEffect(() => {
    const savedEmail = localStorage.getItem('notification_email');
    const savedName = localStorage.getItem('user_name');
    if (savedEmail) setNotificationEmail(savedEmail);
    if (savedName) setUserName(savedName);
  }, []);

  useEffect(() => {
    // Calculer les périodes d'absence (LEAVE et SCHOOL uniquement)
    const periods: AbsencePeriod[] = [];

    // Helper to get status from value (handling DayData and DayStatus)
    const getEffectiveStatus = (value: DayStatus | DayData): DayStatus | null => {
      if (isDayData(value)) {
        // For half-day, prioritize LEAVE or SCHOOL
        if (value.am === 'LEAVE' || value.am === 'SCHOOL') return value.am;
        if (value.pm === 'LEAVE' || value.pm === 'SCHOOL') return value.pm;
        return null;
      }
      if (value === 'LEAVE' || value === 'SCHOOL') return value;
      return null;
    };

    const sortedDates = Object.entries(calendarData)
      .filter(([, value]) => getEffectiveStatus(value) !== null)
      .sort(([a], [b]) => a.localeCompare(b));

    let currentPeriod: AbsencePeriod | null = null;

    for (const [date, value] of sortedDates) {
      const status = getEffectiveStatus(value);
      if (!status) continue;

      if (!currentPeriod || currentPeriod.type !== status || !isConsecutive(currentPeriod.end, date)) {
        if (currentPeriod) {
          periods.push(currentPeriod);
        }
        currentPeriod = {
          start: date,
          end: date,
          type: status,
          label: STATUS_LABELS[status],
        };
      } else {
        currentPeriod.end = date;
      }
    }

    if (currentPeriod) {
      periods.push(currentPeriod);
    }

    setAbsencePeriods(periods);
  }, [calendarData]);

  const isConsecutive = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    // Considérer comme consécutif si moins de 4 jours (pour sauter les week-ends)
    return diffDays <= 3;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const togglePeriod = (index: number) => {
    const newSelected = new Set(selectedPeriods);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPeriods(newSelected);
  };

  const selectAll = () => {
    if (selectedPeriods.size === absencePeriods.length) {
      setSelectedPeriods(new Set());
    } else {
      setSelectedPeriods(new Set(absencePeriods.map((_, i) => i)));
    }
  };

  const generateEmailContent = (): { subject: string; body: string } => {
    const selected = absencePeriods.filter((_, i) => selectedPeriods.has(i));

    const periodsText = selected
      .map((p) => {
        if (p.start === p.end) {
          return `- ${p.label} : ${formatDate(p.start)}`;
        }
        return `- ${p.label} : du ${formatDate(p.start)} au ${formatDate(p.end)}`;
      })
      .join('\n');

    const subject = `[Absence] ${userName || 'Collaborateur'} - Notification d'absence`;

    const body = `Bonjour,

Je vous informe de mes prochaines absences :

${periodsText}

${selected.some(p => p.type === 'LEAVE') ? 'Un fichier ICS est disponible pour ajouter ces dates à votre calendrier.' : ''}

Cordialement,
${userName || 'Votre collaborateur'}

---
Généré automatiquement par Absencia`;

    return { subject, body };
  };

  const sendNotification = () => {
    if (!notificationEmail) {
      toast.error('Configurez l\'email destinataire dans les paramètres');
      setSendSuccess(false);
      return;
    }

    if (selectedPeriods.size === 0) {
      toast.error('Sélectionnez au moins une période d\'absence');
      setSendSuccess(false);
      return;
    }

    setIsSending(true);
    setSendSuccess(null);

    const { subject, body } = generateEmailContent();
    const mailtoUrl = `mailto:${notificationEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Ouvrir le client email
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      toast.success('Client email ouvert avec la notification');
      // Reset success state after animation
      setTimeout(() => setSendSuccess(null), 2000);
    }, 500);
  };

  // Configuration requise - Design glass avec accent amber
  if (!notificationEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-elevated rounded-2xl p-6 border-amber-500/20"
      >
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0"
          >
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </motion.div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-amber-400 text-lg">Configuration requise</h4>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Configurez votre nom et l&apos;email destinataire dans les paramètres pour envoyer des notifications.
              </p>
            </div>
            <Link href="/settings">
              <motion.button
                className="btn-secondary text-amber-400 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30 gap-2"
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-4 h-4" />
                Aller aux parametres
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Aucune absence - Empty state elegant
  if (absencePeriods.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center"
        >
          <Calendar className="w-8 h-8 text-[var(--text-muted)]" />
        </motion.div>
        <motion.h4
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-[var(--text-primary)] text-lg mb-2"
        >
          Aucune absence planifiee
        </motion.h4>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto"
        >
          Marquez des jours en &quot;Conges&quot; ou &quot;Formation&quot; dans le calendrier pour creer des notifications.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Header avec destinataire */}
      <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm">
            <span className="text-[var(--text-tertiary)]">Destinataire</span>
            <p className="font-medium text-[var(--text-primary)]">{notificationEmail}</p>
          </div>
        </div>
        <motion.button
          onClick={selectAll}
          className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10"
          whileTap={{ scale: 0.98 }}
        >
          {selectedPeriods.size === absencePeriods.length ? 'Tout deselectionner' : 'Tout selectionner'}
        </motion.button>
      </div>

      {/* Liste des periodes */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {absencePeriods.map((period, index) => {
            const style = STATUS_STYLES[period.type];
            const isSelected = selectedPeriods.has(index);

            return (
              <motion.div
                key={`${period.start}-${period.type}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => togglePeriod(index)}
                className={cn(
                  "group relative p-4 rounded-xl border cursor-pointer transition-all duration-300",
                  isSelected
                    ? "glass-elevated border-amber-500/30 shadow-[0_0_20px_-10px_rgba(245,158,11,0.3)]"
                    : "glass border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Selection glow effect */}
                {isSelected && (
                  <motion.div
                    layoutId="selection-glow"
                    className="absolute inset-0 rounded-xl bg-amber-500/5 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                <div className="relative flex items-center gap-4">
                  {/* Checkbox */}
                  <motion.div
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                      isSelected
                        ? "bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "border-[var(--border-strong)] bg-transparent group-hover:border-amber-500/50"
                    )}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 45 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                          <Check className="w-3.5 h-3.5 text-black" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Status indicator dot */}
                  <div className={cn("w-2.5 h-2.5 rounded-full", style.dot)} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border",
                        style.bg, style.text, style.border
                      )}>
                        {period.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1.5 font-mono tracking-tight">
                      {period.start === period.end
                        ? formatDate(period.start)
                        : `${formatDate(period.start)} → ${formatDate(period.end)}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bouton d'envoi */}
      <motion.button
        onClick={sendNotification}
        disabled={selectedPeriods.size === 0 || isSending}
        className={cn(
          "relative w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden",
          selectedPeriods.size === 0
            ? "bg-[var(--bg-overlay)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]"
            : "btn-primary"
        )}
        whileHover={selectedPeriods.size > 0 ? { scale: 1.02, y: -2 } : {}}
        whileTap={selectedPeriods.size > 0 ? { scale: 0.98 } : {}}
      >
        {/* Background animation on sending */}
        <AnimatePresence>
          {isSending && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Success animation */}
        <AnimatePresence mode="wait">
          {sendSuccess === true ? (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Email ouvert !</span>
            </motion.div>
          ) : sendSuccess === false ? (
            <motion.div
              key="error"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Erreur</span>
            </motion.div>
          ) : isSending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Ouverture...</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              {selectedPeriods.size > 0 ? (
                <>
                  <Send className="w-5 h-5" />
                  <span>Envoyer la notification</span>
                  <span className="px-2 py-0.5 rounded-md bg-black/20 text-xs font-bold">
                    {selectedPeriods.size}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Selectionnez des periodes</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-[var(--text-muted)] text-center flex items-center justify-center gap-2"
      >
        <Mail className="w-3 h-3" />
        Ouvre votre client email avec un message pre-rempli
      </motion.p>
    </motion.div>
  );
}
