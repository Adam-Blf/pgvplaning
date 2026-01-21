'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Calendar, AlertCircle, Check, Settings } from 'lucide-react';
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

const STATUS_STYLES: Record<DayStatus, string> = {
  WORK: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  REMOTE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  SCHOOL: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  TRAINER: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  LEAVE: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  HOLIDAY: 'bg-red-500/10 text-red-500 border-red-500/20',
  OFF: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export function NotificationSender() {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [absencePeriods, setAbsencePeriods] = useState<AbsencePeriod[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(new Set());
  const [isSending, setIsSending] = useState(false);
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
      return;
    }

    if (selectedPeriods.size === 0) {
      toast.error('Sélectionnez au moins une période d\'absence');
      return;
    }

    setIsSending(true);

    const { subject, body } = generateEmailContent();
    const mailtoUrl = `mailto:${notificationEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Ouvrir le client email
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setIsSending(false);
      toast.success('Client email ouvert avec la notification');
    }, 500);
  };

  if (!notificationEmail) {
    return (
      <div className="bg-amber-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6 animate-pulse-slow">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-amber-500 mb-1">Configuration requise</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Configurez votre nom et l&apos;email destinataire dans les paramètres pour envoyer des notifications.
            </p>
            <Link href="/settings">
              <motion.button
                className="px-4 py-2 bg-amber-500/20 text-amber-500 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-4 h-4" />
                Aller aux paramètres
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (absencePeriods.length === 0) {
    return (
      <div className="bg-muted/30 backdrop-blur-xl rounded-2xl border border-white/5 p-6 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
        <h4 className="font-bold text-foreground mb-1">Aucune absence planifiée</h4>
        <p className="text-sm text-muted-foreground">
          Marquez des jours en &quot;Congés&quot; ou &quot;Formation&quot; dans le calendrier pour créer des notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec destinataire */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>Destinataire :</span>
          <span className="font-medium text-foreground">{notificationEmail}</span>
        </div>
        <motion.button
          onClick={selectAll}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {selectedPeriods.size === absencePeriods.length ? 'Tout désélectionner' : 'Tout sélectionner'}
        </motion.button>
      </div>

      {/* Liste des périodes */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {absencePeriods.map((period, index) => (
            <motion.div
              key={`${period.start}-${period.type}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => togglePeriod(index)}
              className={cn(
                "p-3 rounded-xl border cursor-pointer transition-all duration-200",
                selectedPeriods.has(index)
                  ? "bg-primary/10 border-primary/30 shadow-sm"
                  : "bg-background/40 border-white/5 hover:bg-white/5 hover:border-white/10"
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
                    selectedPeriods.has(index)
                      ? "bg-primary border-primary scale-110"
                      : "border-muted-foreground/30 bg-transparent"
                  )}
                >
                  {selectedPeriods.has(index) && <Check className="w-3 h-3 text-white" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_STYLES[period.type])}>
                      {period.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {period.start === period.end
                      ? formatDate(period.start)
                      : `${formatDate(period.start)} → ${formatDate(period.end)}`}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bouton d'envoi */}
      <motion.button
        onClick={sendNotification}
        disabled={selectedPeriods.size === 0 || isSending}
        className={cn(
          "w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg",
          selectedPeriods.size === 0
            ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
            : "bg-primary text-white hover:bg-primary/90 hover:shadow-primary/25"
        )}
        whileHover={selectedPeriods.size > 0 ? { scale: 1.02 } : {}}
        whileTap={selectedPeriods.size > 0 ? { scale: 0.98 } : {}}
      >
        {isSending ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Ouverture...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Envoyer la notification ({selectedPeriods.size} période{selectedPeriods.size > 1 ? 's' : ''})
          </>
        )}
      </motion.button>

      <p className="text-xs text-muted-foreground/60 text-center">
        Ouvre votre client email avec un message pré-rempli
      </p>
    </div>
  );
}
