'use client';

import { motion } from 'framer-motion';
import { Users, Plus, LogIn, Activity } from 'lucide-react';
import Link from 'next/link';

export default function TeamSetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Bienvenue sur PGV Planning
          </h1>
          <p className="text-[var(--text-muted)] mt-2">
            Pour commencer, rejoignez ou créez une équipe
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Link href="/team/create" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card p-6 cursor-pointer hover:border-[var(--accent)] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                  <Plus className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Créer une équipe
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Vous êtes chef d&apos;équipe ? Créez votre équipe et invitez vos collègues avec un code unique.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/team/join" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card p-6 cursor-pointer hover:border-[var(--accent)] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <LogIn className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                    Rejoindre une équipe
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Vous avez un code d&apos;équipe ? Entrez-le pour rejoindre votre équipe existante.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Pourquoi une équipe ?
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Les équipes permettent de partager le calendrier entre collègues.
                Tous les membres voient les disponibilités de chacun en temps réel.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
