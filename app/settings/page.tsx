'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Save,
  Trash2,
  Check,
  Mail,
  User,
  Zap,
  Settings,
  Bell,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCalendarData } from '@/hooks/use-calendar-data';

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

// Custom Toggle component
function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <motion.div
      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex-1">
        <p className="font-medium text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
          enabled
            ? 'bg-amber-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]'
            : 'bg-[var(--bg-overlay)] border border-[var(--border-default)]'
        }`}
      >
        <motion.div
          className={`absolute top-1 w-5 h-5 rounded-full shadow-md ${
            enabled ? 'bg-black' : 'bg-[var(--text-muted)]'
          }`}
          animate={{ left: enabled ? 'calc(100% - 24px)' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

// Section Header component
function SectionHeader({
  icon: Icon,
  title,
  badge,
  gradient = false,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  gradient?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <motion.div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          gradient
            ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20'
            : 'bg-[var(--bg-overlay)] border border-[var(--border-subtle)]'
        }`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Icon
          className={`w-5 h-5 ${gradient ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}
        />
      </motion.div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        {badge && (
          <span className="badge-amber text-xs">{badge}</span>
        )}
      </div>
    </div>
  );
}

// Input Field component
function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  rightElement,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  rightElement?: React.ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
        {label}
      </label>
      <motion.div
        className={`relative rounded-xl transition-all duration-300 ${
          isFocused ? 'ring-2 ring-amber-500/20' : ''
        }`}
        animate={{ scale: isFocused ? 1.01 : 1 }}
      >
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none z-10" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-12 pl-11 pr-12 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-amber-500/50 focus:outline-none transition-all"
          placeholder={placeholder}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function SettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const { resetData } = useCalendarData();

  useEffect(() => {
    const savedEmail = localStorage.getItem('notification_email');
    const savedName = localStorage.getItem('user_name');
    const savedEmailNotif = localStorage.getItem('email_notifications');
    const savedPushNotif = localStorage.getItem('push_notifications');

    if (savedEmail) {
      setNotificationEmail(savedEmail);
      setIsEmailSaved(true);
    }
    if (savedName) {
      setUserName(savedName);
    }
    if (savedEmailNotif !== null) {
      setEmailNotifications(savedEmailNotif === 'true');
    }
    if (savedPushNotif !== null) {
      setPushNotifications(savedPushNotif === 'true');
    }
  }, []);

  const saveSettings = () => {
    if (notificationEmail.trim()) {
      localStorage.setItem('notification_email', notificationEmail.trim());
      localStorage.setItem('user_name', userName.trim());
      localStorage.setItem('email_notifications', String(emailNotifications));
      localStorage.setItem('push_notifications', String(pushNotifications));
      setIsEmailSaved(true);
      toast.success('Parametres sauvegardes avec succes', {
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      });
    } else {
      toast.error('Veuillez entrer une adresse email valide');
    }
  };

  const handleReset = () => {
    resetData();
    setShowConfirmReset(false);
    toast.success('Calendrier reinitialise', {
      icon: <Trash2 className="w-4 h-4" />,
    });
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Settings className="w-7 h-7 text-amber-500" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text-amber">Parametres</span>
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Configurez votre experience Absencia
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile & Notifications Card */}
      <motion.div variants={cardVariants} className="card p-6 mb-5">
        <SectionHeader icon={User} title="Profil & Notifications" gradient />

        <div className="space-y-5">
          <InputField
            icon={User}
            label="Votre nom"
            value={userName}
            onChange={(v) => {
              setUserName(v);
              setIsEmailSaved(false);
            }}
            placeholder="Jean Dupont"
          />

          <InputField
            icon={Mail}
            label="Email pour les notifications"
            value={notificationEmail}
            onChange={(v) => {
              setNotificationEmail(v);
              setIsEmailSaved(false);
            }}
            placeholder="manager@entreprise.com"
            type="email"
            rightElement={
              isEmailSaved && notificationEmail ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-5 h-5 text-emerald-500" />
                </motion.div>
              ) : null
            }
          />

          <motion.div
            className="flex items-start gap-2 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Info className="w-4 h-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[var(--text-muted)]">
              Cet email recevra les notifications d&apos;absence generees depuis la page Exports.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Notification Preferences Card */}
      <motion.div variants={cardVariants} className="card p-6 mb-5">
        <SectionHeader icon={Bell} title="Preferences de notification" />

        <div className="space-y-3">
          <Toggle
            enabled={emailNotifications}
            onChange={(v) => {
              setEmailNotifications(v);
              setIsEmailSaved(false);
            }}
            label="Notifications par email"
            description="Recevoir les alertes par email"
          />

          <Toggle
            enabled={pushNotifications}
            onChange={(v) => {
              setPushNotifications(v);
              setIsEmailSaved(false);
            }}
            label="Notifications push"
            description="Alertes en temps reel dans le navigateur"
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="mb-8">
        <motion.button
          onClick={saveSettings}
          className="w-full btn-primary h-12 text-base font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className="w-5 h-5" />
          Sauvegarder les parametres
          <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
        </motion.button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="divider my-8" />

      {/* Danger Zone Card */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent p-6"
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />

        <SectionHeader icon={Shield} title="Zone de danger" />

        <div className="relative">
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Attention : cette action effacera tous les statuts du calendrier et ne peut pas etre annulee.
          </p>

          <AnimatePresence mode="wait">
            {!showConfirmReset ? (
              <motion.button
                key="initial"
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium hover:bg-rose-500/20 hover:border-rose-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                Reinitialiser le calendrier
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-rose-300">
                    Confirmer la suppression ?
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-hover)] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Supprimer
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={itemVariants} className="mt-10 text-center">
        <motion.div
          className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-5 h-5 text-amber-500" />
            </motion.div>
            <span className="font-semibold text-[var(--text-primary)]">Absencia Pro</span>
          </div>
          <span className="badge-amber">v9.0</span>
        </motion.div>
        <p className="text-xs text-[var(--text-disabled)] mt-3">
          Fait avec passion par Blackout Prod
        </p>
      </motion.div>
    </motion.div>
  );
}
