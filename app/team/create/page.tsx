'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TeamCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdTeam, setCreatedTeam] = useState<{ name: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setCreatedTeam({ name: data.team.name, code: data.team.code });
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>

            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Équipe créée !
            </h1>
            <p className="text-[var(--text-muted)] mb-6">
              Partagez ce code avec vos collègues pour qu&apos;ils rejoignent <strong>{createdTeam.name}</strong>
            </p>

            {/* Code display */}
            <div className="relative mb-6">
              <div className="bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-default)] rounded-xl p-6">
                <p className="text-3xl font-mono font-bold tracking-[0.3em] text-[var(--accent)]">
                  {createdTeam.code}
                </p>
              </div>
              <button
                onClick={copyCode}
                className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--accent)] transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </button>
            </div>

            <button
              onClick={goToCalendar}
              className="btn btn-primary w-full"
            >
              Accéder au calendrier
            </button>

            <p className="text-xs text-[var(--text-muted)] mt-4">
              Vous pourrez retrouver ce code dans les paramètres de l&apos;équipe
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Back link */}
          <Link
            href="/team/setup"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Créer une équipe
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Un code unique sera généré automatiquement
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Nom de l&apos;équipe *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: DIM Saint-Antoine"
                className="input w-full"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Description (optionnel)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Équipe du département d'information médicale"
                className="input w-full resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn btn-primary w-full mt-6"
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
