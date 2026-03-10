'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  Calendar,
  FileDown,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: Step[] = [
  {
    title: "Bienvenue sur Absencia",
    description: "Votre nouvel outil de gestion de planning intelligent et collaboratif. Simple, fluide et ultra-rapide.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Travaillez en Équipe",
    description: "Créez votre propre équipe ou rejoignez-en une existante pour synchroniser vos agendas en temps réel.",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Gérez vos Congés",
    description: "Posez vos jours en quelques clics. Votre solde est calculé automatiquement selon votre contrat.",
    icon: Calendar,
    color: "from-crimson-500 to-rose-500",
  },
  {
    title: "Exportez Partout",
    description: "Générez des fichiers ICS pour intégrer votre planning Absencia dans Google Calendar ou Outlook.",
    icon: FileDown,
    color: "from-gold-500 to-amber-500",
  },
  {
    title: "Prêt à décoller ?",
    description: "Vous avez maintenant toutes les clés pour optimiser votre organisation. C'est parti !",
    icon: Rocket,
    color: "from-indigo-500 to-purple-500",
  },
];

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasSeenOnboarding = localStorage.getItem('absencia_onboarding_seen');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('absencia_onboarding_seen', 'true');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 flex">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-full transition-all duration-500",
                  i <= currentStep ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-transparent"
                )}
              />
            ))}
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 pt-12">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon Container with Animated Background */}
              <div className="relative">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className={cn(
                    "w-24 h-24 rounded-[2rem] bg-gradient-to-br flex items-center justify-center shadow-2xl relative z-10",
                    step.color
                  )}
                >
                  <step.icon className="w-12 h-12 text-white" />
                </motion.div>
                <div className={cn(
                  "absolute inset-0 blur-2xl opacity-40 rounded-full",
                  step.color
                )} />
              </div>

              <div className="space-y-2">
                <motion.h2
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white tracking-tight"
                >
                  {step.title}
                </motion.h2>
                <motion.p
                  key={`desc-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[var(--text-secondary)] leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-white/5 bg-white/[0.02]">
            <Button
              variant="ghost"
              onClick={prevStep}
              className={cn(
                "rounded-xl h-12 px-4 transition-all",
                currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </Button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "w-6 bg-white" : "bg-white/20"
                  )}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="rounded-xl h-12 px-6 bg-white text-black hover:bg-zinc-200 transition-all font-bold flex items-center"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Commencer
                  <Rocket className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
