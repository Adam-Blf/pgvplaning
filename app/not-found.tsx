'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Ghost } from 'lucide-react';
import { WorldWrapper } from '@/components/layout/world-wrapper';
import { GlassCard } from '@/components/ui/glass-card';
import { MagneticButton } from '@/components/ui/magnetic-button';

export default function NotFound() {
  return (
    <WorldWrapper>
      <main className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center" padding="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Fantôme animé */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block"
            >
              <Ghost className="w-24 h-24 text-blue-400 mx-auto" />
            </motion.div>

            {/* Code d'erreur */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold text-gradient">
                404
              </h1>
            </motion.div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold">
                Page introuvable
              </h2>
              <p className="text-gray-500">
                Oups ! Cette page semble s&apos;être perdue dans le calendrier...
              </p>
            </div>

            {/* Bouton retour */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/">
                <MagneticButton variant="primary" size="lg">
                  <Home className="w-5 h-5 mr-2" />
                  Retour à l&apos;accueil
                </MagneticButton>
              </Link>
            </motion.div>
          </motion.div>
        </GlassCard>
      </main>
    </WorldWrapper>
  );
}
