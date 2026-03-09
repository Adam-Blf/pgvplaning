'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 max-w-md w-full text-center">
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
            <Ghost className="w-24 h-24 text-violet-400 mx-auto" />
          </motion.div>

          {/* Code d'erreur */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Page introuvable
            </h2>
            <p className="text-slate-400">
              Oups ! Cette page semble s&apos;être perdue dans le calendrier...
            </p>
          </div>

          {/* Bouton retour */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
