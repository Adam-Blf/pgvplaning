'use client';

import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-6">
        {/* Logo animé */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
        >
          <Calendar className="w-10 h-10 text-white" />
        </motion.div>

        {/* Texte de chargement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Chargement...
          </h2>

          {/* Barre de progression animée */}
          <div className="w-48 h-1 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ width: '50%' }}
            />
          </div>
        </motion.div>

        {/* Points de chargement */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
