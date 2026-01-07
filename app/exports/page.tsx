'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Home as HomeIcon, GraduationCap, Plane, Bot, Mail, ListChecks, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { Spotlight } from '@/components/ui/spotlight';

const exportCards = [
  {
    id: 'REMOTE',
    title: 'Télétravail',
    description: 'Export des jours "Remote"',
    icon: HomeIcon,
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/20',
    hoverBorder: 'hover:border-purple-300',
    hoverShadow: 'hover:shadow-purple-100',
    iconColor: 'text-purple-500',
  },
  {
    id: 'SCHOOL',
    title: 'Formation',
    description: 'Statut "Absent du bureau"',
    icon: GraduationCap,
    color: 'orange',
    gradient: 'from-orange-500/20 to-orange-600/20',
    hoverBorder: 'hover:border-orange-300',
    hoverShadow: 'hover:shadow-orange-100',
    iconColor: 'text-orange-500',
  },
  {
    id: 'LEAVE',
    title: 'Congés',
    description: 'Jours de repos posés',
    icon: Plane,
    color: 'pink',
    gradient: 'from-pink-500/20 to-pink-600/20',
    hoverBorder: 'hover:border-pink-300',
    hoverShadow: 'hover:shadow-pink-100',
    iconColor: 'text-pink-500',
  },
];

export default function ExportsPage() {
  const { data, formatDateKey } = useCalendarData();
  const [aiTone, setAiTone] = useState('professionnel');
  const [aiReason, setAiReason] = useState('formation');
  const [aiTaskTopic, setAiTaskTopic] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const downloadICS = (mode: string) => {
    const events: string[] = [];
    const currentYear = new Date().getFullYear();

    // Collecter les dates pour ce mode
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

  const askGemini = async (type: 'OOF' | 'TASKS') => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      toast.error('Clé API Gemini manquante. Configurez-la dans Paramètres.');
      return;
    }

    setIsLoading(true);
    setAiResult('');

    let prompt = '';
    if (type === 'OOF') {
      prompt = `Rédige un message d'absence (Out of Office) court pour un employé. Raison: ${aiReason}. Ton: ${aiTone}. Inclus impérativement le texte "[DATE_RETOUR]" là où je dois mettre la date. Ne mets pas d'objet de mail, juste le corps.`;
    } else {
      prompt = `Génère une checklist de 5 à 7 tâches concrètes pour : "${aiTaskTopic}". Format : liste à puces simple.`;
    }

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey }),
      });

      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
      } else {
        setAiResult(result.text);
        toast.success('Généré avec succès !');
      }
    } catch {
      toast.error('Erreur de connexion à l\'API');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResult);
    toast.success('Texte copié !');
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 relative">
        <Spotlight
          className="-top-40 right-0 md:right-40 md:-top-20 opacity-40"
          fill="rgba(139, 92, 246, 0.4)"
        />

        {/* Section Exports ICS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          {/* Liquid Glass Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-200/50 text-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                Exports Calendrier
              </h3>
              <span className="text-xs font-mono bg-slate-100/80 text-slate-500 px-2 py-1 rounded-lg border border-slate-200/50">
                Format .ICS
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {exportCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.button
                    key={card.id}
                    onClick={() => downloadICS(card.id)}
                    className={`group p-5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 ${card.hoverBorder} hover:shadow-lg ${card.hoverShadow} transition-all relative overflow-hidden text-left`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <Icon className={`text-2xl ${card.iconColor}`} />
                        <Download className="w-4 h-4 text-slate-300 group-hover:text-current transition-colors" />
                      </div>
                      <h4 className="font-bold text-slate-800">{card.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Section IA Gemini */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          {/* Liquid Glass Gradient Card */}
          <div className="bg-gradient-to-br from-indigo-600/90 to-purple-700/90 backdrop-blur-2xl rounded-3xl shadow-xl text-white p-8 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Assistant IA (Gemini)</h3>
                  <p className="text-indigo-200 text-sm">Automatisez vos tâches administratives</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* OOF Generator */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Message d&apos;Absence
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="flex-1 bg-white/20 border-none text-white text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option className="text-slate-800" value="professionnel">Professionnel</option>
                        <option className="text-slate-800" value="amical">Amical</option>
                        <option className="text-slate-800" value="formel">Formel</option>
                      </select>
                      <select
                        value={aiReason}
                        onChange={(e) => setAiReason(e.target.value)}
                        className="flex-1 bg-white/20 border-none text-white text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <option className="text-slate-800" value="formation">Formation</option>
                        <option className="text-slate-800" value="congés">Congés</option>
                      </select>
                    </div>
                    <button
                      onClick={() => askGemini('OOF')}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Générer le message
                    </button>
                  </div>
                </div>

                {/* Task Generator */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Checklist Tâches
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={aiTaskTopic}
                      onChange={(e) => setAiTaskTopic(e.target.value)}
                      className="w-full bg-white/20 border-none text-white placeholder-indigo-200 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Objectif (ex: Clôture fiscale)"
                    />
                    <button
                      onClick={() => askGemini('TASKS')}
                      disabled={isLoading || !aiTaskTopic}
                      className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Générer la liste
                    </button>
                  </div>
                </div>
              </div>

              {/* Result Area */}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <label className="text-xs font-bold text-indigo-200 uppercase mb-2 block">
                    Résultat IA
                  </label>
                  <textarea
                    value={aiResult}
                    readOnly
                    rows={4}
                    className="w-full bg-white/90 text-slate-800 text-sm rounded-xl p-4 outline-none border-none shadow-inner resize-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="mt-2 text-xs text-white/80 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copier le texte
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
