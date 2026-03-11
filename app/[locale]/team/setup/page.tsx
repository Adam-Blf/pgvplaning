'use client';

import { Users, Plus, LogIn, Sparkles, LogOut } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

export default function TeamSetupPage() {
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) {
      router.push('/login');
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
      {/* Animated grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[var(--bg-base)]/50 to-[var(--bg-base)]" />

      {/* Logout button */}
      <button
        type="button"
        aria-label="Se déconnecter"
        onClick={handleLogout}
        className="fixed top-4 right-4 p-2 rounded-lg bg-[var(--bg-overlay)]/50 border border-[var(--border-default)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/30 transition-[color,background-color,border-color,box-shadow] z-50"
        title="Déconnexion"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <div className="w-full max-w-lg relative">
        {/* Header */}
        <div
          className="text-center mb-10 animate-fade-up opacity-0"
        >
          <div
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--blueprint-500)]/20 to-[var(--cyan-500)]/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-[var(--blueprint-500)]/20 animate-scale-in"
            style={{ animationDelay: '200ms' }}
          >
            <Users className="w-10 h-10 text-[var(--blueprint-500)]" />
          </div>

          <h1 className="text-3xl font-semibold text-white mb-3">
            Bienvenue sur <span className="gradient-text-amber">Absencia</span>
          </h1>
          <p className="text-[var(--text-muted)] max-w-sm mx-auto">
            Créez votre équipe ou rejoignez une équipe existante pour commencer à gérer vos plannings.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4">
          {/* Create Team */}
          <div
            className="animate-fade-up opacity-0"
            style={{ animationDelay: '80ms' }}
          >
            <Link href="/team/create" className="block group">
              <div className="glass rounded-2xl p-6 hover:border-[var(--blueprint-500)]/30 transition-[background-color,border-color,box-shadow] duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-[var(--blueprint-500)]/10 flex items-center justify-center ring-1 ring-[var(--blueprint-500)]/20 group-hover:ring-[var(--blueprint-500)]/40 transition-[box-shadow]">
                    <Plus className="w-7 h-7 text-[var(--blueprint-500)]" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white group-hover:text-[var(--blueprint-500)] transition-colors">
                        Créer une équipe
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--blueprint-500)]/10 text-[var(--blueprint-500)] text-xs font-mono">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Vous êtes responsable ? Créez votre équipe et invitez vos collègues.
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center group-hover:bg-[var(--blueprint-500)]/10 transition-[background-color]">
                    <span
                      className="text-[var(--text-muted)] group-hover:text-[var(--blueprint-500)] transition-colors"
                    >
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div
            className="py-2 animate-fade-in opacity-0"
            style={{ animationDelay: '160ms' }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 divider" />
              <span className="text-xs font-mono text-[var(--text-muted)]">OU</span>
              <div className="flex-1 divider" />
            </div>
          </div>

          {/* Join Team */}
          <div
            className="animate-fade-up opacity-0"
            style={{ animationDelay: '240ms' }}
          >
            <Link href="/team/join" className="block group">
              <div className="glass rounded-2xl p-6 hover:border-emerald-500/30 transition-[background-color,border-color,box-shadow] duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-[box-shadow]">
                    <LogIn className="w-7 h-7 text-emerald-500" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white group-hover:text-emerald-500 transition-colors">
                        Rejoindre une équipe
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono">
                        MEMBRE
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Vous avez un code d&apos;invitation ? Rejoignez votre équipe.
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] flex items-center justify-center group-hover:bg-emerald-500/10 transition-[background-color]">
                    <span
                      className="text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors"
                    >
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer hint */}
        <div
          className="mt-10 text-center animate-fade-in opacity-0"
          style={{ animationDelay: '320ms' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-overlay)]/50 border border-[var(--border-default)]">
            <Sparkles className="w-4 h-4 text-[var(--cyan-400)]/60" />
            <span className="text-xs text-[var(--text-muted)]">
              Gérez les congés de votre équipe en toute simplicité
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
