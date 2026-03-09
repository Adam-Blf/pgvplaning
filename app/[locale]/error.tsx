'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erreur application:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card max-w-md w-full text-center p-8"
      >
        <div className="space-y-6">
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--error-bg)] flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-[var(--error)]" />
            </div>
          </motion.div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--error)]">
              Oups ! Une erreur s&apos;est produite
            </h1>
            <p className="text-[var(--text-secondary)]">
              Ne vous inquiétez pas, ce n&apos;est pas grave. Essayez de rafraîchir la page.
            </p>
            {error.digest && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Code erreur: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>

            <Link
              href="/"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
