'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  MousePointer2,
  Users,
  FileDown,
  Settings,
  Paintbrush,
  Download,
  UserPlus,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Info,
  Keyboard,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sections = [
  {
    id: 'calendrier',
    title: 'Utiliser le Calendrier',
    icon: Calendar,
    color: 'from-indigo-500 to-violet-600',
    steps: [
      {
        title: 'Sélectionner des jours',
        description: 'Cliquez et glissez sur les jours pour les sélectionner. Vous pouvez sélectionner plusieurs jours d\'un coup.',
        icon: MousePointer2,
      },
      {
        title: 'Choisir un statut',
        description: 'Une fois les jours sélectionnés, la barre d\'outils apparaît. Cliquez sur le statut souhaité : Bureau, Télétravail, Formation, etc.',
        icon: Paintbrush,
      },
      {
        title: 'Demi-journées',
        description: 'Utilisez les options Matin (AM) ou Après-midi (PM) pour marquer uniquement une demi-journée.',
        icon: Calendar,
      },
    ],
  },
  {
    id: 'equipe',
    title: 'Gérer son Équipe',
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    steps: [
      {
        title: 'Créer une équipe',
        description: 'Allez dans "Team Planner" et créez votre équipe. Un code unique à 8 caractères sera généré automatiquement.',
        icon: UserPlus,
      },
      {
        title: 'Inviter des membres',
        description: 'Partagez le code d\'équipe ou générez un lien d\'invitation. Les membres pourront rejoindre en quelques clics.',
        icon: Users,
      },
      {
        title: 'Rôles disponibles',
        description: 'Chef d\'équipe : gestion complète. Admin : peut modifier les plannings. Membre : consultation et modification de son propre planning.',
        icon: Crown,
      },
    ],
  },
  {
    id: 'export',
    title: 'Exporter son Planning',
    icon: FileDown,
    color: 'from-amber-500 to-orange-600',
    steps: [
      {
        title: 'Choisir le type d\'export',
        description: 'Sélectionnez les catégories à exporter : Télétravail, Formation, Congés, etc.',
        icon: CheckCircle2,
      },
      {
        title: 'Télécharger le fichier ICS',
        description: 'Cliquez sur "Exporter" pour télécharger un fichier .ics compatible avec tous les calendriers.',
        icon: Download,
      },
      {
        title: 'Importer dans votre calendrier',
        description: 'Ouvrez le fichier .ics avec Google Calendar, Outlook ou Apple Calendar pour synchroniser vos événements.',
        icon: Calendar,
      },
    ],
  },
  {
    id: 'parametres',
    title: 'Paramètres',
    icon: Settings,
    color: 'from-rose-500 to-pink-600',
    steps: [
      {
        title: 'Profil utilisateur',
        description: 'Modifiez votre nom, email et préférences de notification.',
        icon: Settings,
      },
      {
        title: 'Notifications',
        description: 'Activez ou désactivez les notifications par email et push pour les rappels d\'équipe.',
        icon: Sparkles,
      },
      {
        title: 'Gestion du compte',
        description: 'Supprimez votre compte si nécessaire. Cette action est irréversible.',
        icon: Info,
      },
    ],
  },
];

const shortcuts = [
  { keys: ['Clic', '+', 'Glisser'], action: 'Sélectionner plusieurs jours' },
  { keys: ['Échap'], action: 'Annuler la sélection' },
  { keys: ['←', '→'], action: 'Naviguer entre les mois' },
];

const tips = [
  'Les jours fériés français sont automatiquement marqués en rouge.',
  'Votre solde de congés se met à jour automatiquement.',
  'Les anniversaires de l\'équipe apparaissent avec une icône gâteau.',
  'Utilisez le générateur IA pour créer des messages d\'absence professionnels.',
];

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/[0.07] rounded-full blur-[100px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-indigo-500/[0.05] rounded-full blur-[80px] translate-y-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text-amber">
                Guide d'utilisation
              </h1>
              <p className="text-[var(--text-secondary)]">
                Apprenez à utiliser Absencia en quelques minutes
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quick Start */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <div className="card p-6 md:p-8 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Démarrage rapide
              </h2>
              <p className="text-[var(--text-secondary)] mb-4">
                3 étapes pour commencer à utiliser Absencia :
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="btn-secondary text-sm">
                  <span>1. Créer un compte</span>
                </Link>
                <Link href="/team/setup" className="btn-secondary text-sm">
                  <span>2. Rejoindre une équipe</span>
                </Link>
                <Link href="/calendar" className="btn-primary text-sm">
                  <span>3. Commencer à planifier</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 mb-12"
      >
        {sections.map((section) => (
          <motion.section
            key={section.id}
            variants={itemVariants}
            id={section.id}
            className="card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                <section.icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {section.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {section.steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-amber-500 transition-colors">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-amber-500">
                      Étape {index + 1}
                    </span>
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>

      {/* Shortcuts & Tips */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Keyboard Shortcuts */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Raccourcis
            </h3>
          </div>
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.action}
                className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {shortcut.action}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <span key={i}>
                      {key === '+' || key === '→' || key === '←' ? (
                        <span className="text-[var(--text-muted)] text-xs mx-1">{key}</span>
                      ) : (
                        <kbd className="px-2 py-1 text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-default)] rounded">
                          {key}
                        </kbd>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Astuces
            </h3>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      {/* Mobile App Notice */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">
              Application mobile
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Absencia est une Progressive Web App (PWA). Ajoutez-la à votre écran d'accueil pour une expérience native sur mobile.
            </p>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-[var(--text-muted)] mb-4">
          Des questions ? Consultez notre FAQ ou contactez-nous.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/contact" className="btn-secondary">
            Contact
          </Link>
          <Link href="/calendar" className="btn-primary">
            <Calendar className="w-4 h-4" />
            <span>Ouvrir le calendrier</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
