'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, AlertTriangle, Save, Trash2, Check, Mail, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { Spotlight } from '@/components/ui/spotlight';

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
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 relative">
        <Spotlight
          className="-top-40 left-0 md:left-20 md:-top-20 opacity-40"
          fill="rgba(34, 197, 94, 0.3)"
        />

        {/* Assistant IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100/80 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              Assistant IA
            </h3>

            {/* Status IA */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-medium text-green-900">IA Active</p>
                  <p className="text-xs text-green-700">Propulsé par Mistral 7B (Open Source, Gratuit)</p>
                </div>
              </div>
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

        {/* Notifications Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative z-10"
        >
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100/80 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-500" />
              </div>
              Notifications d&apos;Absence
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Votre nom (pour les notifications)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      setIsEmailSaved(false);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/50 bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email destinataire des notifications
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => {
                        setNotificationEmail(e.target.value);
                        setIsEmailSaved(false);
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/50 bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="manager@entreprise.com"
                    />
                    {isEmailSaved && notificationEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  <motion.button
                    onClick={saveEmailSettings}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium flex items-center gap-2"
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
