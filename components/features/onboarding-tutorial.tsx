'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MousePointerClick,
  FileDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Briefcase,
  Home,
  GraduationCap,
  Presentation,
  Palmtree,
  Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TUTORIAL_COOKIE = 'absencia_tutorial_seen';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Bienvenue sur Absencia !',
    description: 'Découvrez comment gérer votre planning d\'équipe en quelques étapes simples.',
    icon: Sparkles,
    content: (
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-3xl gradient-amber flex items-center justify-center mx-auto mb-6 glow-amber animate-pulse-glow"
        >
          <Calendar className="w-12 h-12 text-black" />
        </motion.div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Cette application vous permet de planifier vos journées de travail, télétravail, formations et congés,
          puis d&apos;exporter votre planning au format ICS.
        </p>
      </div>
    ),
  },
  {
    title: 'Sélectionnez un type de journée',
    description: 'Utilisez la barre d&apos;outils pour choisir le type de journée à marquer.',
    icon: MousePointerClick,
    content: (
      <div className="space-y-4 py-4">
        <p className="text-[var(--text-tertiary)] text-sm mb-5">
          Chaque bouton représente un type de journée différent :
        </p>
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 cursor-default transition-all hover:border-indigo-500/40 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-indigo-400">Bureau</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 cursor-default transition-all hover:border-emerald-500/40 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Home className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-emerald-400">Télétravail</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-default transition-all hover:border-amber-500/40 hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-amber-400">Formation reçue</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 cursor-default transition-all hover:border-violet-500/40 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Presentation className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-sm font-medium text-violet-400">Formateur</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 cursor-default transition-all hover:border-rose-500/40 hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Palmtree className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-sm font-medium text-rose-400">Congés</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] cursor-default transition-all hover:border-[var(--border-default)]"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center">
              <Eraser className="w-4 h-4 text-[var(--text-tertiary)]" />
            </div>
            <span className="text-sm font-medium text-[var(--text-tertiary)]">Gomme</span>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    title: 'Cliquez ou glissez sur le calendrier',
    description: 'Marquez vos journées en cliquant ou en glissant sur les dates.',
    icon: Calendar,
    content: (
      <div className="py-4">
        <div className="glass-elevated rounded-2xl p-5 mb-5">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs mb-3">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div
                key={i}
                className={cn(
                  "py-1.5 font-medium",
                  i >= 5 ? 'text-[var(--text-disabled)]' : 'text-[var(--text-tertiary)]'
                )}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <motion.div
                key={d}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: d * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all cursor-default',
                  d === 6 || d === 7
                    ? 'bg-transparent text-[var(--text-disabled)]'
                    : d === 3
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)]'
                      : d === 4
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_-5px_rgba(245,158,11,0.4)]'
                        : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)]'
                )}
              >
                {d}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            <strong className="text-amber-400">Astuce :</strong> Maintenez le clic et glissez pour marquer plusieurs jours d&apos;un coup !
            Les week-ends sont automatiquement grisés.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Exportez votre planning',
    description: 'Téléchargez vos plannings au format ICS pour les importer dans votre calendrier.',
    icon: FileDown,
    content: (
      <div className="py-4">
        <div className="space-y-3 mb-5">
          <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            className="flex items-center gap-4 p-4 rounded-xl glass-elevated cursor-default transition-all hover:border-amber-500/30"
          >
            <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center flex-shrink-0">
              <FileDown className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)]">Fichier ICS personnel</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Pour votre calendrier personnel</p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            className="flex items-center gap-4 p-4 rounded-xl glass-elevated cursor-default transition-all hover:border-amber-500/30"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <FileDown className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)]">Fichier ICS équipe</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Avec votre nom pour la boîte partagée</p>
            </div>
          </motion.div>
        </div>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Compatible avec <span className="text-[var(--text-primary)] font-medium">Outlook</span>,{' '}
          <span className="text-[var(--text-primary)] font-medium">Google Calendar</span> et{' '}
          <span className="text-[var(--text-primary)] font-medium">Apple Calendar</span>.
        </p>
      </div>
    ),
  },
];

export function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Check if tutorial has been seen using cookie
    const hasSeen = document.cookie.includes(TUTORIAL_COOKIE);
    if (!hasSeen) {
      // Small delay for better UX
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleClose = () => {
    // Set cookie to remember tutorial was seen (expires in 1 year)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `${TUTORIAL_COOKIE}=true; expires=${expiryDate.toUTCString()}; path=/`;
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  // Animation variants pour le contenu
  const contentVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop avec effet ambient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--bg-base)]/90 backdrop-blur-xl"
            onClick={handleClose}
          />

          {/* Glow effect derrière la modal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            className="relative w-full max-w-lg glass-elevated rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Gradient border top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            {/* Header */}
            <div className="relative p-6 pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-14 h-14 rounded-2xl gradient-amber-soft border border-amber-500/20 flex items-center justify-center"
                  >
                    <Icon className="w-7 h-7 text-amber-500" />
                  </motion.div>
                  <div>
                    <motion.h3
                      key={`title-${currentStep}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-bold text-[var(--text-primary)] text-xl tracking-tight"
                    >
                      {step.title}
                    </motion.h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                        Étape {currentStep + 1}
                      </span>
                      <span className="text-[var(--text-disabled)]">/</span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {tutorialSteps.length}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[300px]">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-[var(--text-secondary)] text-sm leading-relaxed"
              >
                {step.description}
              </motion.p>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-4">
              {tutorialSteps.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToStep(index)}
                  className="relative p-1 group"
                  aria-label={`Aller à l'étape ${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      index === currentStep
                        ? 'w-8 gradient-amber glow-amber-sm'
                        : 'w-2 bg-[var(--border-default)] group-hover:bg-[var(--border-strong)]'
                    )}
                    layoutId="progress-dot"
                  />
                  {index === currentStep && (
                    <motion.div
                      layoutId="progress-glow"
                      className="absolute inset-0 rounded-full bg-amber-500/20 blur-md"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className="divider mx-6" />

            {/* Footer */}
            <div className="flex items-center justify-between p-6 pt-5">
              <motion.button
                onClick={handlePrev}
                disabled={currentStep === 0}
                whileHover={currentStep > 0 ? { x: -3 } : {}}
                whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                className={cn(
                  "btn-ghost",
                  currentStep === 0 && 'opacity-40 cursor-not-allowed'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </motion.button>

              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary min-w-[140px]"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    Commencer
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.span>
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
