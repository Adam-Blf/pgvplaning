'use client';

import {
  ArrowRight,
  Calendar,
  FileDown,
  Zap,
  MousePointerClick,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8 stagger-children">
      {/* Hero Section */}
      <div className="card card-glass relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-transparent" />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative z-10 py-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="badge badge-accent">
              <Heart className="w-3 h-3" />
              <span>Secteur Hospitalier</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">
            Bienvenue sur <span className="text-gradient">PGV Planning</span>
          </h2>

          <p className="text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Solution professionnelle de gestion des plannings hospitaliers.
            Organisez vos gardes, astreintes, formations et congés en quelques clics.
            Exportez au format ICS compatible avec tous vos calendriers.
          </p>
        </div>
      </div>

      {/* Quick Start Steps */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <MousePointerClick className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Comment utiliser
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <Link href="/calendar" className="block no-underline group">
            <div className="card card-interactive h-full">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[var(--status-work-bg)] border border-[var(--status-work)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-[var(--status-work)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge">Étape 1</span>
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                    Remplir le calendrier
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Sélectionnez vos jours et leur type : présence, télétravail, formation ou congés
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>
          </Link>

          {/* Step 2 */}
          <Link href="/exports" className="block no-underline group">
            <div className="card card-interactive h-full">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[var(--status-remote-bg)] border border-[var(--status-remote)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileDown className="w-6 h-6 text-[var(--status-remote)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge">Étape 2</span>
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                    Exporter en ICS
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Téléchargez le fichier à importer dans Outlook, Google Calendar ou Apple Calendar
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Actions rapides
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/calendar" className="btn w-full justify-start gap-3 h-auto py-4 px-5">
            <Calendar className="w-5 h-5" />
            <div className="text-left">
              <span className="font-semibold block">Ouvrir le calendrier</span>
              <span className="text-xs opacity-80">Planifier mes journées</span>
            </div>
          </Link>

          <Link href="/exports" className="btn btn-secondary w-full justify-start gap-3 h-auto py-4 px-5">
            <FileDown className="w-5 h-5" />
            <div className="text-left">
              <span className="font-semibold block">Exporter mon planning</span>
              <span className="text-xs opacity-80">Télécharger le fichier ICS</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Info Notice */}
      <div className="notice notice-info">
        <div className="w-10 h-10 rounded-lg bg-[var(--info-bg)] flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-[var(--info)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">
            Confidentialité des données
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Vos données sont stockées localement dans votre navigateur conformément aux normes de confidentialité.
            Aucune information n&apos;est transmise à des serveurs externes.
          </p>
        </div>
      </div>
    </div>
  );
}
