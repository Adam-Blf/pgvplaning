'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Copy, Check, Loader2, Calendar, Building2, Briefcase, LogOut } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function TeamCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState<'public' | 'private'>('public');
  const [defaultLeaveDays, setDefaultLeaveDays] = useState(25);
  const [loading, setLoading] = useState(false);
  const [createdTeam, setCreatedTeam] = useState<{ name: string; code: string; sector: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Veuillez entrer un nom d\'équipe');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          sector,
          defaultLeaveDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setCreatedTeam({ name: data.team.name, code: data.team.code, sector: data.team.sector });
      toast.success('Équipe créée avec succès !');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!createdTeam) return;

    try {
      await navigator.clipboard.writeText(createdTeam.code);
      setCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const goToCalendar = () => {
    router.push('/calendar');
  };

  // Success state - show team code
  if (createdTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
        {/* Grid background */}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative"
        >
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/20">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>

            <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
              Équipe créée !
            </h1>
            <p className="text-zinc-400 mb-2">
              Partagez ce code avec vos collègues pour qu&apos;ils rejoignent <strong className="text-zinc-200">{createdTeam.name}</strong>
            </p>
            <p className="text-xs text-zinc-600 font-mono mb-6">
              SECTEUR: {createdTeam.sector === 'public' ? 'PUBLIC' : 'PRIVÉ'}
            </p>

            {/* Code display */}
            <div className="relative mb-6">
              <div className="bg-zinc-950 border-2 border-dashed border-zinc-700 rounded-xl p-6">
                <p className="text-3xl font-mono font-bold tracking-[0.3em] text-amber-500">
                  {createdTeam.code}
                </p>
              </div>
              <button
                onClick={copyCode}
                className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>

            <button
              onClick={goToCalendar}
              className="w-full px-4 py-3 rounded-xl bg-amber-500 text-zinc-900 font-medium hover:bg-amber-400 transition-colors"
            >
              Accéder au calendrier
            </button>

            <p className="text-xs text-zinc-600 mt-4">
              Vous pourrez retrouver ce code dans Administration
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      {/* Grid background */}
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

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all z-50"
        title="Déconnexion"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm p-8">
          {/* Back link */}
          <Link
            href="/team/setup"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-500 transition-colors mb-6 font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            RETOUR
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-100">
                Créer une équipe
              </h1>
              <p className="text-sm text-zinc-500">
                Un code unique sera généré automatiquement
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-mono text-zinc-500 mb-2">
                NOM DE L&apos;ÉQUIPE *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: DIM Saint-Antoine"
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-mono text-zinc-500 mb-2">
                DESCRIPTION (OPTIONNEL)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Équipe Marketing ou Service Commercial"
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Sector Selection */}
            <div className="pt-4 border-t border-zinc-800/50">
              <label className="block text-xs font-mono text-zinc-500 mb-3">
                SECTEUR D&apos;ACTIVITÉ *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSector('public')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    sector === 'public'
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-zinc-700/50 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sector === 'public' ? 'bg-blue-500/10' : 'bg-zinc-800'
                    }`}>
                      <Building2 className={`w-5 h-5 ${
                        sector === 'public' ? 'text-blue-500' : 'text-zinc-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        sector === 'public' ? 'text-blue-400' : 'text-zinc-300'
                      }`}>Public</p>
                      <p className="text-xs text-zinc-600">Administrations, services</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSector('private')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    sector === 'private'
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-zinc-700/50 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sector === 'private' ? 'bg-emerald-500/10' : 'bg-zinc-800'
                    }`}>
                      <Briefcase className={`w-5 h-5 ${
                        sector === 'private' ? 'text-emerald-500' : 'text-zinc-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        sector === 'private' ? 'text-emerald-400' : 'text-zinc-300'
                      }`}>Privé</p>
                      <p className="text-xs text-zinc-600">Entreprises</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Leave Days */}
            <div>
              <label htmlFor="leaveDays" className="block text-xs font-mono text-zinc-500 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                JOURS DE CONGÉS / AN *
              </label>
              <input
                id="leaveDays"
                type="number"
                min={0}
                max={60}
                value={defaultLeaveDays}
                onChange={(e) => setDefaultLeaveDays(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                required
              />
              <p className="text-xs text-zinc-600 mt-1.5">
                Ce nombre sera appliqué à tous les membres de l&apos;équipe
              </p>
            </div>

            {/* Summary */}
            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-600 font-mono text-xs">RÉCAPITULATIF:</span><br />
                <span className="text-zinc-200">{defaultLeaveDays} jours</span> de congés par an pour tous les membres
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full px-4 py-3 rounded-xl bg-amber-500 text-zinc-900 font-medium hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer l\'équipe'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
