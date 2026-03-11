'use client';

import { useState, useEffect } from 'react';

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
    title: "Bienvenue sur PGV Planning",
    description: "Votre nouvel outil universel de gestion d'équipe et de planning. Simple, fluide et ultra-rapide.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Travaillez en Équipe",
    description: "Créez votre propre équipe ou rejoignez-en une existante : entreprise, association, collectivité, club, groupe projet... Synchronisation en temps réel.",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Gérez vos Plannings & Activités",
    description: "Planifiez absences, événements, réunions, entraînements, bénévolat, interventions... Votre solde est calculé automatiquement selon vos règles.",
    icon: Calendar,
    color: "from-crimson-500 to-rose-500",
  },
  {
    title: "Exportez Partout",
    description: "Générez des fichiers ICS pour intégrer votre planning dans Google Calendar, Outlook ou Apple Calendar.",
    icon: FileDown,
    color: "from-gold-500 to-amber-500",
  },
  {
    title: "Prêt à décoller ?",
    description: "Vous avez maintenant toutes les clés pour optimiser l'organisation de votre équipe, quel que soit votre secteur.",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        />

        {/* Modal */}
        <div
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl animate-scale-in"
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
                <div
                  key={currentStep}
                  className={cn(
                    "w-24 h-24 rounded-[2rem] bg-gradient-to-br flex items-center justify-center shadow-2xl relative z-10 animate-fade-in",
                    step.color
                  )}
                >
                  <step.icon className="w-12 h-12 text-white" />
                </div>
                <div className={cn(
                  "absolute inset-0 blur-2xl opacity-40 rounded-full",
                  step.color
                )} />
              </div>

              <div className="space-y-2">
                <h2
                  key={`title-${currentStep}`}
                  className="text-2xl font-bold text-white tracking-tight animate-fade-in"
                >
                  {step.title}
                </h2>
                <p
                  key={`desc-${currentStep}`}
                  className="text-[var(--text-secondary)] leading-relaxed animate-fade-in"
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-white/5 bg-white/[0.02]">
            <Button
              variant="ghost"
              onClick={prevStep}
              className={cn(
                "rounded-xl h-12 px-4 hover:scale-105 active:scale-95 transition-all duration-200",
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
                    i === currentStep ? "w-6 bg-white animate-scale-in" : "bg-white/20"
                  )}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="rounded-xl h-12 px-6 bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200 font-bold flex items-center"
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
        </div>
      </div>
  );
}
