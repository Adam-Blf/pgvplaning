'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Database, AlertTriangle, Save, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { Spotlight } from '@/components/ui/spotlight';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { resetData, loadDemoData } = useCalendarData();

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) {
      setApiKey(saved);
      setIsSaved(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsSaved(true);
      toast.success('Clé API sauvegardée');
    }
  };

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment effacer toutes les données du calendrier ?')) {
      resetData();
      toast.success('Calendrier réinitialisé');
    }
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success('Données de démonstration chargées');
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 relative">
        <Spotlight
          className="-top-40 left-0 md:left-20 md:-top-20 opacity-40"
          fill="rgba(34, 197, 94, 0.3)"
        />

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          {/* Liquid Glass Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center">
                <Key className="w-4 h-4 text-slate-500" />
              </div>
              Configuration
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Clé API Gemini (Optionnel)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-white/50 bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="AIza..."
                  />
                  {isSaved && apiKey && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={saveApiKey}
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </motion.button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                La clé est stockée uniquement dans votre navigateur pour l&apos;IA.
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline ml-1"
                >
                  Obtenir une clé
                </a>
              </p>
            </div>

            <div className="border-t border-slate-200/50 pt-6">
              <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Données de Démonstration
              </h4>
              <p className="text-sm text-slate-500 mb-3">
                Chargez un exemple de planning avec alternance, télétravail et congés.
              </p>
              <motion.button
                onClick={handleLoadDemo}
                className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/50 text-slate-700 rounded-xl hover:bg-white/80 text-sm font-medium transition flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Database className="w-4 h-4" />
                Charger un exemple (Alternance)
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Zone de Danger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          {/* Liquid Glass Red Card */}
          <div className="bg-red-50/60 backdrop-blur-2xl rounded-3xl border border-red-200/50 shadow-[0_8px_32px_rgba(239,68,68,0.1),inset_0_1px_0_rgba(255,255,255,0.5)] p-8">
            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              Zone de Danger
            </h3>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-red-900">Réinitialiser le calendrier</p>
                <p className="text-sm text-red-700 opacity-80">
                  Efface tous les statuts et revient à zéro.
                </p>
              </div>
              <motion.button
                onClick={handleReset}
                className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-medium shadow-sm flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4" />
                Tout effacer
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-slate-400 relative z-10"
        >
          <p>PGV Planning Pro • Version 9.0</p>
          <p className="text-xs mt-1">Fait avec ❤️ en France</p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
