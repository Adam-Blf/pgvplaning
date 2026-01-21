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
    description: 'Découvrez comment gérer votre planning d\'équipe en quelques étapes simples.',
    icon: Sparkles,
    content: (
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <p className="text-muted-foreground">
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
        <p className="text-muted-foreground text-sm mb-4">
          Chaque bouton représente un type de journée différent :
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-status-work/10 border border-status-work/20">
            <Briefcase className="w-4 h-4 text-status-work" />
            <span className="text-sm font-medium text-status-work">Bureau</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-status-remote/10 border border-status-remote/20">
            <Home className="w-4 h-4 text-status-remote" />
            <span className="text-sm font-medium text-status-remote">Télétravail</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-status-school/10 border border-status-school/20">
            <GraduationCap className="w-4 h-4 text-status-school" />
            <span className="text-sm font-medium text-status-school">Formation reçue</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Presentation className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-500">Formateur</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-status-leave/10 border border-status-leave/20">
            <Palmtree className="w-4 h-4 text-status-leave" />
            <span className="text-sm font-medium text-status-leave">Congés</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-white/5">
            <Eraser className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Gomme</span>
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
        <div className="bg-card/50 border border-white/5 rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className={`py-1 ${i >= 5 ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div
                key={d}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center text-sm font-medium',
                  d === 6 || d === 7
                    ? 'bg-transparent text-muted-foreground/30'
                    : d === 3
                      ? 'bg-status-remote/10 border border-status-remote/20 text-status-remote'
                      : d === 4
                        ? 'bg-status-school/10 border border-status-school/20 text-status-school'
                        : 'bg-status-work/10 border border-status-work/20 text-status-work'
                )}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
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
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-white/5 shadow-sm">
            <FileDown className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Fichier ICS personnel</p>
              <p className="text-xs text-muted-foreground">Pour votre calendrier personnel</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-white/5 shadow-sm">
            <FileDown className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Fichier ICS équipe</p>
              <p className="text-xs text-muted-foreground">Avec votre nom pour la boîte partagée</p>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-white/10 overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg tracking-tight">{step.title}</h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                    Étape {currentStep + 1} / {tutorialSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{step.description}</p>
              {step.content}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-6">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentStep
                      ? 'w-8 bg-primary shadow-glow-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Aller à l'étape ${index + 1}`}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/10">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95",
                  currentStep === 0
                    ? 'text-muted-foreground/50 cursor-not-allowed opacity-50'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
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
