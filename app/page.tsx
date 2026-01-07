'use client';

import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { WorldWrapper } from '@/components/layout/world-wrapper';
import { PageTransition } from '@/components/layout/page-transition';
import { VacationForm } from '@/components/features/vacation-form';
import { HistoryList } from '@/components/features/history-list';
import { useContextualTheme } from '@/hooks/use-contextual-theme';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { BackgroundBeams } from '@/components/ui/background-beams';

export default function Home() {
  const { season, dayCycle, specialEvent } = useContextualTheme();

  const getGreeting = () => {
    switch (dayCycle) {
      case 'dawn':
        return 'Bonjour';
      case 'day':
        return 'Bonjour';
      case 'dusk':
        return 'Bonsoir';
      case 'night':
        return 'Bonne nuit';
      default:
        return 'Bienvenue';
    }
  };

  const getSeasonEmoji = () => {
    switch (season) {
      case 'spring':
        return '🌸';
      case 'summer':
        return '☀️';
      case 'autumn':
        return '🍂';
      case 'winter':
        return '❄️';
      default:
        return '📅';
    }
  };

  return (
    <WorldWrapper>
      <PageTransition>
        <main className="relative min-h-screen py-8 px-4 md:py-12 md:px-6 overflow-hidden">
          {/* Spotlight Effect */}
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="rgba(59, 130, 246, 0.5)"
          />

          {/* Background Beams */}
          <BackgroundBeams className="opacity-40" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-8 md:space-y-12">
            {/* En-tête avec effets */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              {/* Logo animé avec glow */}
              <motion.div
                className="relative inline-flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg shadow-blue-500/50 flex items-center justify-center">
                  <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </motion.div>

              <div>
                {/* Titre avec effet de génération */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-3"
                >
                  <h1 className="text-3xl md:text-5xl font-bold">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-shimmer bg-[length:200%_100%]">
                      PGV Planning
                    </span>
                  </h1>
                  <span className="text-2xl md:text-4xl">{getSeasonEmoji()}</span>
                </motion.div>

                {/* Sous-titre avec TextGenerateEffect */}
                <div className="mt-4">
                  <TextGenerateEffect
                    words={`${getGreeting()} ! Créez vos fichiers de calendrier en quelques clics.`}
                    className="text-lg md:text-xl text-gray-600 dark:text-gray-300"
                    duration={0.3}
                  />
                </div>

                {/* Badge événement spécial */}
                {specialEvent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                      {specialEvent.name}
                    </span>
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </motion.div>
                )}
              </div>
            </motion.header>

            {/* Formulaire principal avec effet de carte */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />
              <VacationForm />
            </motion.section>

            {/* Historique avec animation */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, type: 'spring' }}
            >
              <HistoryList />
            </motion.section>

            {/* Footer moderne */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center py-8"
            >
              <div className="inline-flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  PGV Planning • Générateur ICS sécurisé
                </div>
                <p className="text-xs text-gray-400">
                  Fait avec ❤️ en France
                </p>
              </div>
            </motion.footer>
          </div>
        </main>
      </PageTransition>
    </WorldWrapper>
  );
}
