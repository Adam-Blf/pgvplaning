'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { MagneticButton } from '@/components/ui/magnetic-button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error('Erreur application:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
      <GlassCard className="max-w-md w-full text-center" padding="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Icône d'alerte */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </motion.div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
              Oups ! Une erreur s&apos;est produite
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Ne vous inquiétez pas, ce n&apos;est pas grave. Essayez de rafraîchir la page.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 mt-2">
                Code erreur: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <MagneticButton
              variant="primary"
              onClick={reset}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </MagneticButton>

            <Link href="/">
              <MagneticButton variant="secondary">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </GlassCard>
    </main>
  );
}
