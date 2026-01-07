'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Home as HomeIcon, GraduationCap, Plane, Mail, Copy, Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { NotificationSender } from '@/components/features/notification-sender';

const exportCards = [
  {
    id: 'REMOTE',
    title: 'Télétravail',
    description: 'Export des jours "Remote"',
    icon: HomeIcon,
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    iconBg: 'bg-emerald-500',
    borderHover: 'hover:border-emerald-500/30',
  },
  {
    id: 'SCHOOL',
    title: 'Formation',
    description: 'Statut "Absent du bureau"',
    icon: GraduationCap,
    gradient: 'from-amber-500/20 to-amber-600/10',
    iconBg: 'bg-amber-500',
    borderHover: 'hover:border-amber-500/30',
  },
  {
    id: 'LEAVE',
    title: 'Congés',
    description: 'Jours de repos posés',
    icon: Plane,
    gradient: 'from-rose-500/20 to-rose-600/10',
    iconBg: 'bg-rose-500',
    borderHover: 'hover:border-rose-500/30',
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

    const summary = mode === 'REMOTE' ? '🏠 Télétravail' : mode === 'SCHOOL' ? '🎓 Formation' : '🌴 Congés';
    const busy = mode === 'REMOTE' ? '' : 'X-MICROSOFT-CDO-BUSYSTATUS:OOF';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PGV Planning Pro//FR',
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

    toast.success(`${events.length} événements exportés`);
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
        toast.success('Message généré !');
      }
    } catch {
      toast.error('Erreur de connexion au LLM');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResult);
    toast.success('Texte copié !');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section Exports ICS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              Exports Calendrier
            </h3>
            <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded-lg">
              Format .ICS
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {exportCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => downloadICS(card.id)}
                  className={`group p-5 bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600/30 ${card.borderHover} hover:bg-slate-700/50 transition-all relative overflow-hidden text-left`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Download className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-white">{card.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Section Notifications Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Notifications d&apos;Absence</h3>
              <p className="text-sm text-slate-400">Informez vos collègues de vos absences par email</p>
            </div>
          </div>
          <NotificationSender />
        </div>
      </motion.div>

      {/* Section Assistant IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-br from-violet-600/90 to-purple-700/90 backdrop-blur-sm rounded-2xl border border-violet-500/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Assistant IA</h3>
                <p className="text-violet-200 text-sm">Mistral 7B (Open Source)</p>
              </div>
            </div>

            {/* OOF Generator */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/50">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                <Mail className="w-4 h-4 text-violet-400" /> Générateur de Message d&apos;Absence
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block font-medium">Ton du message</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full bg-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 border border-slate-600"
                    >
                      <option value="professionnel">Professionnel</option>
                      <option value="amical">Amical</option>
                      <option value="formel">Formel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block font-medium">Raison de l&apos;absence</label>
                    <select
                      value={aiReason}
                      onChange={(e) => setAiReason(e.target.value)}
                      className="w-full bg-slate-700/50 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 border border-slate-600"
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
                  className="w-full py-3 bg-violet-500 text-white rounded-lg font-semibold text-sm hover:bg-violet-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Générer le message
                </button>
              </div>

              {/* Result Area */}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <label className="text-xs font-medium text-slate-400 uppercase mb-2 block">
                    Message généré
                  </label>
                  <textarea
                    value={aiResult}
                    readOnly
                    rows={4}
                    className="w-full bg-slate-700/50 text-white text-sm rounded-lg p-4 outline-none border border-slate-600 resize-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Copy className="w-3 h-3" /> Copier le texte
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
