'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, AlertTriangle, Save, Trash2, Check, Mail, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarData } from '@/hooks/use-calendar-data';

export default function SettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const { resetData, loadDemoData } = useCalendarData();

  useEffect(() => {
    const savedEmail = localStorage.getItem('notification_email');
    const savedName = localStorage.getItem('user_name');
    if (savedEmail) {
      setNotificationEmail(savedEmail);
      setIsEmailSaved(true);
    }
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const saveEmailSettings = () => {
    if (notificationEmail.trim()) {
      localStorage.setItem('notification_email', notificationEmail.trim());
      localStorage.setItem('user_name', userName.trim());
      setIsEmailSaved(true);
      toast.success('Paramètres de notification sauvegardés');
    } else {
      toast.error('Veuillez entrer une adresse email');
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Assistant IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Assistant IA
          </h3>

          {/* Status IA */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="font-medium text-emerald-400">IA Active</p>
                <p className="text-xs text-emerald-400/70">Propulsé par Mistral 7B (Open Source, Gratuit)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-6">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              Données de Démonstration
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Chargez un exemple de planning avec alternance, télétravail et congés.
            </p>
            <motion.button
              onClick={handleLoadDemo}
              className="px-5 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-xl hover:bg-slate-700 text-sm font-medium transition-all flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Database className="w-4 h-4" />
              Charger un exemple (Alternance)
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Notifications Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            Notifications d&apos;Absence
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Votre nom (pour les notifications)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setIsEmailSaved(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email destinataire des notifications
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => {
                      setNotificationEmail(e.target.value);
                      setIsEmailSaved(false);
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                    placeholder="manager@entreprise.com"
                  />
                  {isEmailSaved && notificationEmail && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={saveEmailSettings}
                  className="px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </motion.button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Cet email recevra les notifications d&apos;absence générées depuis la page Exports.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Zone de Danger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-rose-500/10 backdrop-blur-sm rounded-2xl border border-rose-500/20 p-6">
          <h3 className="text-lg font-semibold text-rose-400 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            Zone de Danger
          </h3>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-medium text-rose-300">Réinitialiser le calendrier</p>
              <p className="text-sm text-rose-400/70">
                Efface tous les statuts et revient à zéro.
              </p>
            </div>
            <motion.button
              onClick={handleReset}
              className="px-5 py-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl hover:bg-rose-500/30 transition-all font-medium flex items-center gap-2"
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
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-slate-500"
      >
        <p>PGV Planning Pro • Version 9.0</p>
        <p className="text-xs mt-1">Fait avec ❤️ en France</p>
      </motion.div>
    </div>
  );
}
