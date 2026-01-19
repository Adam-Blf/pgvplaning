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

const TUTORIAL_COOKIE = 'pgv_tutorial_seen';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Bienvenue sur PGV Planning !',
    description: 'Découvrez comment gérer votre planning hospitalier en quelques étapes simples.',
    icon: Sparkles,
    content: (
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-cyan-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <p className="text-[var(--text-secondary)]">
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
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Chaque bouton représente un type de journée différent :
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-work-bg)] border border-[var(--status-work)]">
            <Briefcase className="w-4 h-4 text-[var(--status-work)]" />
            <span className="text-sm font-medium text-[var(--status-work)]">Bureau</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-remote-bg)] border border-[var(--status-remote)]">
            <Home className="w-4 h-4 text-[var(--status-remote)]" />
            <span className="text-sm font-medium text-[var(--status-remote)]">Télétravail</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-training-bg)] border border-[var(--status-training)]">
            <GraduationCap className="w-4 h-4 text-[var(--status-training)]" />
            <span className="text-sm font-medium text-[var(--status-training)]">Formation reçue</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-trainer-bg)] border border-[var(--status-trainer)]">
            <Presentation className="w-4 h-4 text-[var(--status-trainer)]" />
            <span className="text-sm font-medium text-[var(--status-trainer)]">Formateur</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-leave-bg)] border border-[var(--status-leave)]">
            <Palmtree className="w-4 h-4 text-[var(--status-leave)]" />
            <span className="text-sm font-medium text-[var(--status-leave)]">Congés</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
            <Eraser className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Gomme</span>
          </div>
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
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className={`py-1 ${i >= 5 ? 'text-[var(--text-disabled)]' : 'text-[var(--text-muted)]'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div
                key={d}
                className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium ${
                  d === 6 || d === 7
                    ? 'bg-[var(--bg-primary)] text-[var(--text-disabled)]'
                    : d === 3
                    ? 'bg-[var(--status-remote-bg)] border border-[var(--status-remote)] text-[var(--status-remote)]'
                    : d === 4
                    ? 'bg-[var(--status-training-bg)] border border-[var(--status-training)] text-[var(--status-training)]'
                    : 'bg-[var(--status-work-bg)] border border-[var(--status-work)] text-[var(--status-work)]'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">
          <strong>Astuce :</strong> Maintenez le clic et glissez pour marquer plusieurs jours d&apos;un coup !
          Les week-ends sont automatiquement grisés et non sélectionnables.
        </p>
      </div>
    ),
  },
  {
    title: 'Exportez votre planning',
    description: 'Téléchargez vos plannings au format ICS pour les importer dans votre calendrier.',
    icon: FileDown,
    content: (
      <div className="py-4">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <FileDown className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Fichier ICS personnel</p>
              <p className="text-xs text-[var(--text-muted)]">Pour votre calendrier personnel</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <FileDown className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Fichier ICS équipe</p>
              <p className="text-xs text-[var(--text-muted)]">Avec votre nom pour la boîte partagée</p>
            </div>
          </div>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">
          Compatible avec <strong>Outlook</strong>, <strong>Google Calendar</strong> et <strong>Apple Calendar</strong>.
        </p>
      </div>
    ),
  },
];

export function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Étape {currentStep + 1} sur {tutorialSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[var(--text-secondary)] text-sm mb-4">{step.description}</p>
              {step.content}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-4">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-6 bg-[var(--accent)]'
                      : 'bg-[var(--border-default)] hover:bg-[var(--border-subtle)]'
                  }`}
                  aria-label={`Aller à l'étape ${index + 1}`}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 0
                    ? 'text-[var(--text-disabled)] cursor-not-allowed'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    Commencer
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
