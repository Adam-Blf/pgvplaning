'use client';

import { useState } from 'react';
import { Download, Home as HomeIcon, GraduationCap, Plane, Mail, Copy, Loader2, Sparkles, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

const exportCards = [
  {
    id: 'REMOTE',
    title: 'Télétravail',
    description: 'Exporter tous les jours de télétravail',
    icon: HomeIcon,
    colorClass: 'fr-tag--green',
    bgClass: 'bg-[var(--success-bg)]',
    borderClass: 'border-[var(--success)]',
  },
  {
    id: 'SCHOOL',
    title: 'Formation',
    description: 'Exporter les jours de formation (statut absent)',
    icon: GraduationCap,
    colorClass: 'fr-tag--orange',
    bgClass: 'bg-[var(--warning-bg)]',
    borderClass: 'border-[var(--warning)]',
  },
  {
    id: 'LEAVE',
    title: 'Congés',
    description: 'Exporter tous les congés posés',
    icon: Plane,
    colorClass: 'fr-tag--red',
    bgClass: 'bg-[var(--error-bg)]',
    borderClass: 'border-[var(--error)]',
  },
];

export default function ExportsPage() {
  const { data, formatDateKey } = useCalendarData();
  const [aiTone, setAiTone] = useState('professionnel');
  const [aiReason, setAiReason] = useState('formation');
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const downloadICS = (mode: string) => {
    const events: string[] = [];
    const currentYear = new Date().getFullYear();

    const start = new Date(currentYear - 1, 0, 1);
    const end = new Date(currentYear + 1, 11, 31);
    const current = new Date(start);

    while (current <= end) {
      const key = formatDateKey(current);
      if (data[key] === mode) {
        events.push(key.replace(/-/g, ''));
      }
      current.setDate(current.getDate() + 1);
    }

    if (events.length === 0) {
      toast.error('Aucune date trouvée pour ce type');
      return;
    }

    const summary = mode === 'REMOTE' ? 'Télétravail' : mode === 'SCHOOL' ? 'Formation' : 'Congés';
    const busy = mode === 'REMOTE' ? '' : 'X-MICROSOFT-CDO-BUSYSTATUS:OOF';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PGV Planning//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach((date) => {
      ics.push('BEGIN:VEVENT');
      ics.push(`DTSTART;VALUE=DATE:${date}`);
      ics.push(`DTEND;VALUE=DATE:${date}`);
      ics.push(`SUMMARY:${summary}`);
      ics.push('TRANSP:OPAQUE');
      if (busy) ics.push(busy);
      ics.push(`UID:${date}-${mode}@pgvplanning`);
      ics.push('END:VEVENT');
    });

    ics.push('END:VCALENDAR');

    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `planning_${mode.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${events.length} événements exportés avec succès`);
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
    <div className="space-y-8">
      {/* Instructions */}
      <div className="fr-alert fr-alert--info">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Exportation au format ICS</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Les fichiers ICS sont compatibles avec tous les calendriers : Outlook, Google Calendar, Apple Calendar, etc.
              Après téléchargement, importez le fichier dans votre application de calendrier.
            </p>
          </div>
        </div>
      </div>

      {/* Section Exports ICS */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-title)] mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-[var(--bleu-france)]" />
          Télécharger les fichiers ICS
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {exportCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => downloadICS(card.id)}
                className={cn(
                  'fr-card fr-card--shadow text-left hover:border-[var(--bleu-france)] transition-all group',
                  'hover:shadow-lg'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', card.bgClass, 'border-l-4', card.borderClass)}>
                    <Icon className="w-6 h-6 text-[var(--text-title)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[var(--text-mention)] mt-1">
                      {card.description}
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section Assistant Message d'absence */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-title)] mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[var(--bleu-france)]" />
          Générateur de message d'absence
        </h2>

        <div className="fr-card fr-card--shadow">
          <p className="text-[var(--text-mention)] text-sm mb-6">
            Générez automatiquement un message de réponse automatique (Out of Office) pour informer vos correspondants de votre absence.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="tone" className="fr-label">
                Ton du message
              </label>
              <select
                id="tone"
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="fr-select"
              >
                <option value="professionnel">Professionnel</option>
                <option value="amical">Amical</option>
                <option value="formel">Formel</option>
              </select>
            </div>
            <div>
              <label htmlFor="reason" className="fr-label">
                Raison de l'absence
              </label>
              <select
                id="reason"
                value={aiReason}
                onChange={(e) => setAiReason(e.target.value)}
                className="fr-select"
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
            className="fr-btn w-full md:w-auto"
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
            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
              <div className="flex items-center justify-between mb-3">
                <label className="fr-label flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                  Message généré
                </label>
                <button
                  onClick={copyToClipboard}
                  className="fr-btn fr-btn--tertiary text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>
              <textarea
                value={aiResult}
                readOnly
                rows={5}
                className="fr-input resize-none bg-[var(--background-contrast)]"
              />
              <p className="fr-hint mt-2">
                Pensez à remplacer [DATE_RETOUR] par votre date de retour effective.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Note sur le service */}
      <div className="fr-alert fr-alert--warning">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Service de génération</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Le générateur de message utilise un modèle d'intelligence artificielle open source (Mistral 7B).
              Les résultats peuvent varier. Pensez à relire et adapter le message avant utilisation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
