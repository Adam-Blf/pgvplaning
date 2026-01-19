'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Save,
  Trash2,
  Check,
  Mail,
  User,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarData } from '@/hooks/use-calendar-data';

export default function SettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const { resetData } = useCalendarData();

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

  return (
    <div className="max-w-2xl mx-auto space-y-6 stagger-children">
      {/* Notifications Email */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--info-bg)] flex items-center justify-center">
            <Mail className="w-5 h-5 text-[var(--info)]" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Notifications d&apos;Absence
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Votre nom (pour les notifications)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setIsEmailSaved(false);
                }}
                className="input pl-10"
                placeholder="Jean Dupont"
              />
            </div>
          </div>

          <div>
            <label className="label">Email destinataire des notifications</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => {
                    setNotificationEmail(e.target.value);
                    setIsEmailSaved(false);
                  }}
                  className="input pl-10 pr-10"
                  placeholder="manager@entreprise.com"
                />
                {isEmailSaved && notificationEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-[var(--success)]" />
                  </div>
                )}
              </div>
              <button onClick={saveEmailSettings} className="btn">
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
            </div>
            <p className="hint mt-2">
              Cet email recevra les notifications d&apos;absence générées depuis la page Exports.
            </p>
          </div>
        </div>
      </div>

      {/* Zone de Danger */}
      <div className="notice notice-error">
        <div className="w-10 h-10 rounded-xl bg-[var(--error-bg)] flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            Zone de Danger
          </h4>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Efface tous les statuts et revient à zéro. Cette action est irréversible.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[var(--error-bg)] border border-[var(--error)] text-[var(--error)] rounded-lg hover:bg-[var(--error)] hover:text-[var(--bg-primary)] transition-all font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Tout effacer
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
          <Zap className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-medium">PGV Planning Pro</span>
          <span className="badge">v9.0</span>
        </div>
        <p className="text-xs text-[var(--text-disabled)] mt-2">
          Fait avec ❤️ par Blackout Prod
        </p>
      </div>
    </div>
  );
}
