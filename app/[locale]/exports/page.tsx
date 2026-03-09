'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Home as HomeIcon,
  GraduationCap,
  Plane,
  Mail,
  Copy,
  Loader2,
  Sparkles,
  Info,
  CheckCircle,
  FileDown,
  AlertTriangle,
  Users,
  User,
  ArrowRight,
  Calendar,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarData, DayStatus, isDayData } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

const exportCards = [
  {
    id: 'REMOTE' as DayStatus,
    title: 'Télétravail',
    description: 'Exporter tous les jours de télétravail',
    icon: HomeIcon,
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    buttonHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
  },
  {
    id: 'SCHOOL' as DayStatus,
    title: 'Formation reçue',
    description: 'Exporter les jours où vous suivez une formation',
    icon: GraduationCap,
    color: 'amber',
    gradient: 'from-amber-500/20 to-amber-600/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    buttonHover: 'hover:border-amber-500/40 hover:bg-amber-500/5',
  },
  {
    id: 'TRAINER' as DayStatus,
    title: 'Formateur / Réunion',
    description: 'Exporter les jours de formation donnée ou réunion',
    icon: Users,
    color: 'violet',
    gradient: 'from-violet-500/20 to-violet-600/5',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-400',
    buttonHover: 'hover:border-violet-500/40 hover:bg-violet-500/5',
  },
  {
    id: 'LEAVE' as DayStatus,
    title: 'Congés',
    description: 'Exporter tous les congés posés',
    icon: Plane,
    color: 'rose',
    gradient: 'from-rose-500/20 to-rose-600/5',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    buttonHover: 'hover:border-rose-500/40 hover:bg-rose-500/5',
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  hover: {
    y: -4,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};

export default function ExportsPage() {
  const { data } = useCalendarData();
  const [userName, setUserName] = useState('');
  const [aiTone, setAiTone] = useState('professionnel');
  const [aiReason, setAiReason] = useState('formation');
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeExport, setActiveExport] = useState<string | null>(null);

  // Charger le nom utilisateur depuis localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) setUserName(savedName);
  }, []);

  // Count days per status (handling both legacy and half-day formats)
  const dayCounts = useMemo(() => {
    const counts: Record<DayStatus, number> = {
      WORK: 0,
      REMOTE: 0,
      SCHOOL: 0,
      TRAINER: 0,
      LEAVE: 0,
      HOLIDAY: 0,
      OFF: 0,
    };

    Object.values(data).forEach((value) => {
      if (isDayData(value)) {
        // Half-day format: count each half-day separately (0.5 each)
        if (value.am) counts[value.am] += 0.5;
        if (value.pm) counts[value.pm] += 0.5;
      } else {
        // Legacy format: full day
        counts[value]++;
      }
    });

    // Round to handle floating point
    Object.keys(counts).forEach((key) => {
      counts[key as DayStatus] = Math.round(counts[key as DayStatus] * 10) / 10;
    });

    return counts;
  }, [data]);

  // Collecter les événements une seule fois (optimisation performance)
  const eventsByStatus = useMemo(() => {
    const result: Record<DayStatus, { date: string; halfDay?: 'AM' | 'PM' }[]> = {
      WORK: [],
      REMOTE: [],
      SCHOOL: [],
      TRAINER: [],
      LEAVE: [],
      HOLIDAY: [],
      OFF: [],
    };

    // Parcourir uniquement les données existantes (pas toutes les dates)
    Object.entries(data).forEach(([key, value]) => {
      const dateStr = key.replace(/-/g, '');
      if (isDayData(value)) {
        if (value.am) result[value.am].push({ date: dateStr, halfDay: 'AM' });
        if (value.pm) result[value.pm].push({ date: dateStr, halfDay: 'PM' });
      } else {
        result[value].push({ date: dateStr });
      }
    });

    return result;
  }, [data]);

  const downloadICS = (mode: DayStatus, forTeam: boolean = false) => {
    const events = eventsByStatus[mode];

    if (events.length === 0) {
      toast.error('Aucune date trouvée pour ce type');
      return;
    }

    setActiveExport(`${mode}-${forTeam ? 'team' : 'personal'}`);

    const statusLabels: Record<DayStatus, string> = {
      WORK: 'Bureau',
      REMOTE: 'Télétravail',
      SCHOOL: 'Formation reçue',
      TRAINER: 'Formateur/Réunion',
      LEAVE: 'Congés',
      HOLIDAY: 'Jour férié',
      OFF: 'Week-end',
    };

    const baseLabel = statusLabels[mode];
    // Pour l'équipe, on ajoute le nom de l'utilisateur
    const summary = forTeam && userName
      ? `${userName} - ${baseLabel}`
      : baseLabel;

    const busy = mode === 'REMOTE' ? '' : 'X-MICROSOFT-CDO-BUSYSTATUS:OOF';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Absencia//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach((event) => {
      ics.push('BEGIN:VEVENT');

      if (event.halfDay) {
        const startHour = event.halfDay === 'AM' ? '080000' : '140000';
        const endHour = event.halfDay === 'AM' ? '120000' : '180000';
        const halfLabel = event.halfDay === 'AM' ? ' (Matin)' : ' (Après-midi)';

        ics.push(`DTSTART:${event.date}T${startHour}`);
        ics.push(`DTEND:${event.date}T${endHour}`);
        ics.push(`SUMMARY:${summary}${halfLabel}`);
      } else {
        ics.push(`DTSTART;VALUE=DATE:${event.date}`);
        ics.push(`DTEND;VALUE=DATE:${event.date}`);
        ics.push(`SUMMARY:${summary}`);
      }

      ics.push('TRANSP:OPAQUE');
      if (busy) ics.push(busy);
      ics.push(`UID:${event.date}-${event.halfDay || 'FULL'}-${mode}-${forTeam ? 'team' : 'personal'}@absencia`);
      ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');

    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const suffix = forTeam ? '_equipe' : '_perso';
    link.download = `planning_${mode.toLowerCase()}${suffix}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setActiveExport(null), 1000);
    toast.success(`${events.length} événements exportés (${forTeam ? 'équipe' : 'personnel'})`);
  };

  const generateOOFMessage = async () => {
    const userName = localStorage.getItem('user_name') || 'Collaborateur';

    setIsLoading(true);
    setAiResult('');

    const prompt = `Rédige un message d'absence (Out of Office) court pour ${userName}. Raison: ${aiReason}. Ton: ${aiTone}. Inclus impérativement le texte "[DATE_RETOUR]" là où il faut mettre la date de retour. Ne mets pas d'objet de mail, juste le corps du message.`;

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, useHuggingFace: true }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
      } else {
        setAiResult(result.text);
        toast.success('Message généré avec succès');
      }
    } catch {
      toast.error('Erreur de connexion au service de génération');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResult);
    toast.success('Texte copié dans le presse-papier');
  };

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header avec titre gradient */}
      <motion.header variants={itemVariants} className="relative">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl gradient-amber flex items-center justify-center shadow-lg shadow-amber-500/20">
            <FileDown className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text-amber">
              Exports & Outils
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Exportez votre planning et générez vos messages d&apos;absence
            </p>
          </div>
        </div>
      </motion.header>

      {/* Notice d'information */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">
              Format ICS universel
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Les fichiers ICS sont compatibles avec tous les calendriers : Outlook, Google Calendar, Apple Calendar, etc.
              Importez simplement le fichier téléchargé dans votre application.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section Exports ICS */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Télécharger les fichiers ICS
          </h2>
        </div>

        {/* Alerte si nom non configuré */}
        <AnimatePresence>
          {!userName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)] mb-0.5 text-sm">
                      Nom non configuré
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Configurez votre nom dans les{' '}
                      <a href="/settings" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                        paramètres
                      </a>{' '}
                      pour personnaliser les exports équipe.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grille des cartes d'export */}
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          {exportCards.map((card, index) => {
            const Icon = card.icon;
            const count = dayCounts[card.id];
            const isDisabled = count === 0;

            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={isDisabled ? undefined : 'hover'}
                custom={index}
                className={cn(
                  'relative rounded-2xl border bg-[var(--bg-surface)] overflow-hidden transition-all duration-300',
                  isDisabled
                    ? 'opacity-50 border-[var(--border-subtle)]'
                    : `${card.borderColor} hover:border-opacity-60`
                )}
              >
                {/* Gradient background overlay */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-50',
                  card.gradient
                )} />

                <div className="relative p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center border',
                        card.iconBg,
                        card.borderColor
                      )}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Icon className={cn('w-6 h-6', card.iconColor)} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--text-primary)]">
                          {card.title}
                        </h3>
                        <span className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          count > 0
                            ? `${card.badgeBg} ${card.badgeText}`
                            : 'bg-[var(--bg-overlay)] text-[var(--text-muted)]'
                        )}>
                          {count} jour{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Boutons de téléchargement */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => downloadICS(card.id, false)}
                      disabled={isDisabled}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium',
                        'border border-[var(--border-default)] transition-all duration-200',
                        isDisabled
                          ? 'bg-[var(--bg-overlay)] text-[var(--text-disabled)] cursor-not-allowed'
                          : 'bg-[var(--bg-overlay)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      {activeExport === `${card.id}-personal` ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>Personnel</span>
                      <Download className="w-3.5 h-3.5 opacity-60" />
                    </motion.button>

                    <motion.button
                      onClick={() => downloadICS(card.id, true)}
                      disabled={isDisabled}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium',
                        'border transition-all duration-200',
                        isDisabled
                          ? 'bg-[var(--bg-overlay)] text-[var(--text-disabled)] cursor-not-allowed border-[var(--border-default)]'
                          : `${card.iconBg} ${card.iconColor} ${card.borderColor} ${card.buttonHover}`
                      )}
                    >
                      {activeExport === `${card.id}-team` ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span>Équipe</span>
                      <Download className="w-3.5 h-3.5 opacity-60" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* Divider */}
      <motion.div variants={itemVariants} className="divider" />

      {/* Section Assistant Message d'absence */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center">
            <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Générateur de message d&apos;absence
          </h2>
          <span className="badge-amber">
            <Wand2 className="w-3 h-3" />
            IA
          </span>
        </div>

        <motion.div
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
          variants={cardVariants}
        >
          {/* Header de la carte */}
          <div className="p-6 border-b border-[var(--border-subtle)] bg-gradient-to-r from-violet-500/5 via-transparent to-transparent">
            <p className="text-[var(--text-secondary)] text-sm">
              Générez automatiquement un message de réponse automatique (Out of Office)
              pour informer vos correspondants de votre absence.
            </p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Ton du message
                </label>
                <select
                  id="tone"
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                >
                  <option value="professionnel">Professionnel</option>
                  <option value="amical">Amical</option>
                  <option value="formel">Formel</option>
                </select>
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Raison de l&apos;absence
                </label>
                <select
                  id="reason"
                  value={aiReason}
                  onChange={(e) => setAiReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                >
                  <option value="formation">Formation</option>
                  <option value="congés">Congés</option>
                  <option value="déplacement">Déplacement professionnel</option>
                  <option value="maladie">Arrêt maladie</option>
                </select>
              </div>
            </div>

            <motion.button
              onClick={generateOOFMessage}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'w-full md:w-auto btn-primary',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer le message
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Résultat */}
            <AnimatePresence mode="wait">
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="mt-6 pt-6 border-t border-[var(--border-subtle)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-[var(--text-primary)]">
                        Message généré
                      </span>
                    </div>
                    <motion.button
                      onClick={copyToClipboard}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-ghost text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
                    </motion.button>
                  </div>
                  <textarea
                    value={aiResult}
                    readOnly
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)] resize-none focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Pensez à remplacer <code className="text-amber-400">[DATE_RETOUR]</code> par votre date de retour effective.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.section>

      {/* Note sur le service */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">
              Service de génération
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Le générateur utilise un modèle d&apos;intelligence artificielle open source (Mistral 7B).
              Les résultats peuvent varier. Pensez à relire et adapter le message avant utilisation.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
