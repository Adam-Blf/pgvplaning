'use client';

import { motion } from 'framer-motion';
import { Users, Plus, LogIn, Sparkles, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TeamSetupPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      {/* Animated grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251, 191, 36, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all z-50"
        title="Déconnexion"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-amber-500/20"
          >
            <Users className="w-10 h-10 text-amber-500" />
          </motion.div>

          <h1 className="text-3xl font-semibold text-zinc-100 mb-3">
            Bienvenue sur <span className="text-amber-500">PGV</span>
          </h1>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Créez votre équipe ou rejoignez une équipe existante pour commencer à gérer vos plannings.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-4">
          {/* Create Team */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/team/create" className="block group">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm p-6 hover:border-amber-500/30 transition-all duration-300 hover:bg-zinc-900/90">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
                    <Plus className="w-7 h-7 text-amber-500" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-500 transition-colors">
                        Créer une équipe
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-mono">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      Vous êtes responsable ? Créez votre équipe et invitez vos collègues.
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-amber-500/10 transition-all">
                    <motion.span
                      className="text-zinc-600 group-hover:text-amber-500 transition-colors"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 py-2"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            <span className="text-xs font-mono text-zinc-600">OU</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          </motion.div>

          {/* Join Team */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/team/join" className="block group">
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm p-6 hover:border-emerald-500/30 transition-all duration-300 hover:bg-zinc-900/90">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
                    <LogIn className="w-7 h-7 text-emerald-500" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-emerald-500 transition-colors">
                        Rejoindre une équipe
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono">
                        MEMBRE
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      Vous avez un code d&apos;invitation ? Rejoignez votre équipe.
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center group-hover:bg-emerald-500/10 transition-all">
                    <motion.span
                      className="text-zinc-600 group-hover:text-emerald-500 transition-colors"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/50">
            <Sparkles className="w-4 h-4 text-amber-500/60" />
            <span className="text-xs text-zinc-500">
              Gérez les congés de votre équipe en toute simplicité
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
