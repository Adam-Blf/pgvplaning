'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Calendar, AlertCircle, Check, Settings } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCalendarData, DayStatus } from '@/hooks/use-calendar-data';

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

const STATUS_COLORS: Record<DayStatus, string> = {
  WORK: 'bg-emerald-100 text-emerald-700',
  REMOTE: 'bg-purple-100 text-purple-700',
  SCHOOL: 'bg-orange-100 text-orange-700',
  TRAINER: 'bg-violet-100 text-violet-700',
  LEAVE: 'bg-pink-100 text-pink-700',
  HOLIDAY: 'bg-red-100 text-red-700',
  OFF: 'bg-slate-100 text-slate-500',
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
    const sortedDates = Object.entries(calendarData)
      .filter(([, status]) => status === 'LEAVE' || status === 'SCHOOL')
      .sort(([a], [b]) => a.localeCompare(b));

    let currentPeriod: AbsencePeriod | null = null;

    for (const [date, status] of sortedDates) {
      if (!currentPeriod || currentPeriod.type !== status || !isConsecutive(currentPeriod.end, date)) {
        if (currentPeriod) {
          periods.push(currentPeriod);
        }
        currentPeriod = {
          start: date,
          end: date,
          type: status as DayStatus,
          label: STATUS_LABELS[status as DayStatus],
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
Généré automatiquement par PGV Planning Pro`;

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
      <div className="bg-amber-50/60 backdrop-blur-xl rounded-2xl border border-amber-200/50 p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-800 mb-1">Configuration requise</h4>
            <p className="text-sm text-amber-700 mb-3">
              Configurez votre nom et l&apos;email destinataire dans les paramètres pour envoyer des notifications.
            </p>
            <Link href="/settings">
              <motion.button
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-amber-200 transition"
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
      <div className="bg-slate-50/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-6 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="font-bold text-slate-600 mb-1">Aucune absence planifiée</h4>
        <p className="text-sm text-slate-500">
          Marquez des jours en &quot;Congés&quot; ou &quot;Formation&quot; dans le calendrier pour créer des notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec destinataire */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail className="w-4 h-4" />
          <span>Destinataire :</span>
          <span className="font-medium text-slate-800">{notificationEmail}</span>
        </div>
        <motion.button
          onClick={selectAll}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          whileTap={{ scale: 0.98 }}
        >
          {selectedPeriods.size === absencePeriods.length ? 'Tout désélectionner' : 'Tout sélectionner'}
        </motion.button>
      </div>

      {/* Liste des périodes */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {absencePeriods.map((period, index) => (
          <motion.div
            key={`${period.start}-${period.type}`}
            onClick={() => togglePeriod(index)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedPeriods.has(index)
                ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                : 'bg-white/60 border-slate-200/50 hover:bg-slate-50'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  selectedPeriods.has(index)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-slate-300'
                }`}
              >
                {selectedPeriods.has(index) && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[period.type]}`}>
                    {period.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {period.start === period.end
                    ? formatDate(period.start)
                    : `${formatDate(period.start)} → ${formatDate(period.end)}`}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton d'envoi */}
      <motion.button
        onClick={sendNotification}
        disabled={selectedPeriods.size === 0 || isSending}
        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${
          selectedPeriods.size === 0
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        whileHover={selectedPeriods.size > 0 ? { scale: 1.01 } : {}}
        whileTap={selectedPeriods.size > 0 ? { scale: 0.99 } : {}}
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

      <p className="text-xs text-slate-400 text-center">
        Ouvre votre client email avec un message pré-rempli
      </p>
    </div>
  );
}
