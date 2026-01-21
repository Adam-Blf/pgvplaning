'use client';

import { useState, useMemo, useEffect } from 'react';
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
    statusClass: 'status-remote',
  },
  {
    id: 'SCHOOL' as DayStatus,
    title: 'Formation reçue',
    description: 'Exporter les jours où vous suivez une formation',
    icon: GraduationCap,
    statusClass: 'status-training',
  },
  {
    id: 'TRAINER' as DayStatus,
    title: 'Formateur/Réunion',
    description: 'Exporter les jours de formation donnée ou réunion',
    icon: GraduationCap,
    statusClass: 'status-trainer',
  },
  {
    id: 'LEAVE' as DayStatus,
    title: 'Congés',
    description: 'Exporter tous les congés posés',
    icon: Plane,
    statusClass: 'status-leave',
  },
];

export default function ExportsPage() {
  const { data } = useCalendarData();
  const [userName, setUserName] = useState('');
  const [aiTone, setAiTone] = useState('professionnel');
  const [aiReason, setAiReason] = useState('formation');
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="space-y-8 stagger-children">
      {/* Instructions */}
      <div className="notice notice-info">
        <div className="w-10 h-10 rounded-lg bg-[var(--info-bg)] flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-[var(--info)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            Exportation au format ICS
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Les fichiers ICS sont compatibles avec tous les calendriers : Outlook, Google Calendar, Apple Calendar, etc.
            Après téléchargement, importez le fichier dans votre application de calendrier.
          </p>
        </div>
      </div>

      {/* Section Exports ICS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <FileDown className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Télécharger les fichiers ICS
          </h2>
        </div>

        {/* Alerte si nom non configuré */}
        {!userName && (
          <div className="notice notice-warning mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--warning-bg)] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                Nom non configuré
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Configurez votre nom dans les <a href="/settings" className="text-[var(--accent)] underline">paramètres</a> pour que les exports équipe affichent votre nom.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {exportCards.map((card) => {
            const Icon = card.icon;
            const count = dayCounts[card.id];
            const statusColors: Record<string, { bg: string; border: string; text: string }> = {
              'status-remote': {
                bg: 'bg-[var(--status-remote-bg)]',
                border: 'border-[var(--status-remote)]',
                text: 'text-[var(--status-remote)]',
              },
              'status-training': {
                bg: 'bg-[var(--status-training-bg)]',
                border: 'border-[var(--status-training)]',
                text: 'text-[var(--status-training)]',
              },
              'status-trainer': {
                bg: 'bg-[var(--status-trainer-bg)]',
                border: 'border-[var(--status-trainer)]',
                text: 'text-[var(--status-trainer)]',
              },
              'status-leave': {
                bg: 'bg-[var(--status-leave-bg)]',
                border: 'border-[var(--status-leave)]',
                text: 'text-[var(--status-leave)]',
              },
            };
            const colors = statusColors[card.statusClass];

            return (
              <div
                key={card.id}
                className={cn(
                  'card',
                  count === 0 && 'opacity-50'
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center border',
                      colors.bg,
                      colors.border
                    )}
                  >
                    <Icon className={cn('w-6 h-6', colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[var(--text-primary)]">
                        {card.title}
                      </h3>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        count > 0 ? `${colors.bg} ${colors.text}` : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
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
                  <button
                    onClick={() => downloadICS(card.id, false)}
                    disabled={count === 0}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      count > 0
                        ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed'
                    )}
                  >
                    <User className="w-4 h-4" />
                    Personnel
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => downloadICS(card.id, true)}
                    disabled={count === 0}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      count > 0
                        ? `${colors.bg} hover:opacity-80 ${colors.text}`
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed'
                    )}
                  >
                    <Users className="w-4 h-4" />
                    Équipe
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Assistant Message d'absence */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <Mail className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Générateur de message d&apos;absence
          </h2>
        </div>

        <div className="card">
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Générez automatiquement un message de réponse automatique (Out of Office) pour informer vos correspondants de votre absence.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="tone" className="label">
                Ton du message
              </label>
              <select
                id="tone"
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="select"
              >
                <option value="professionnel">Professionnel</option>
                <option value="amical">Amical</option>
                <option value="formel">Formel</option>
              </select>
            </div>
            <div>
              <label htmlFor="reason" className="label">
                Raison de l&apos;absence
              </label>
              <select
                id="reason"
                value={aiReason}
                onChange={(e) => setAiReason(e.target.value)}
                className="select"
              >
                <option value="formation">Formation</option>
                <option value="congés">Congés</option>
                <option value="déplacement">Déplacement professionnel</option>
                <option value="maladie">Arrêt maladie</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateOOFMessage}
            disabled={isLoading}
            className="btn w-full md:w-auto"
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
              </>
            )}
          </button>

          {/* Résultat */}
          {aiResult && (
            <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-3">
                <label className="label flex items-center gap-2 mb-0">
                  <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                  Message généré
                </label>
                <button
                  onClick={copyToClipboard}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>
              <textarea
                value={aiResult}
                readOnly
                rows={5}
                className="input resize-none bg-[var(--bg-tertiary)]"
              />
              <p className="hint mt-2">
                Pensez à remplacer [DATE_RETOUR] par votre date de retour effective.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Note sur le service */}
      <div className="notice notice-warning">
        <div className="w-10 h-10 rounded-lg bg-[var(--warning-bg)] flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            Service de génération
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Le générateur de message utilise un modèle d&apos;intelligence artificielle open source (Mistral 7B).
            Les résultats peuvent varier. Pensez à relire et adapter le message avant utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
