'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { WorldWrapper } from '@/components/layout/world-wrapper';
import { PageTransition } from '@/components/layout/page-transition';
import { VacationForm } from '@/components/features/vacation-form';
import { HistoryList } from '@/components/features/history-list';
import { useContextualTheme } from '@/hooks/use-contextual-theme';

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
        <main className="min-h-screen py-8 px-4 md:py-12 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            {/* En-tête */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>

              <div>
                <motion.h1
                  className="text-3xl md:text-5xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-gradient">PGV Planning</span>{' '}
                  <span className="text-2xl md:text-4xl">{getSeasonEmoji()}</span>
                </motion.h1>

                <motion.p
                  className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getGreeting()} ! Créez vos fichiers de calendrier en quelques clics.
                </motion.p>

                {specialEvent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm"
                  >
                    <span className="animate-pulse">✨</span>
                    {specialEvent.name}
                    <span className="animate-pulse">✨</span>
                  </motion.div>
                )}
              </div>
            </motion.header>

            {/* Formulaire principal */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <VacationForm />
            </motion.section>

            {/* Historique */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <HistoryList />
            </motion.section>

            {/* Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-gray-500 py-8"
            >
              <p>
                PGV Planning V9 • Générateur ICS sécurisé
              </p>
              <p className="mt-1">
                Fait avec ❤️ en France
              </p>
            </motion.footer>
          </div>
        </main>
      </PageTransition>
    </WorldWrapper>
  );
}
