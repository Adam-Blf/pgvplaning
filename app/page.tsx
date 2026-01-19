'use client';

import {
  ArrowRight,
  Calendar,
  FileDown,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Composant étape pour démarrer
function StepCard({
  number,
  title,
  description,
  href,
  icon: Icon,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link href={href} className="block no-underline group">
      <div className="fr-card fr-card--shadow hover:border-[var(--bleu-france)] transition-colors">
        <div className="flex items-start gap-4">
          <div className={cn(
            'fr-stepper__number flex-shrink-0',
            'bg-[var(--bleu-france)] text-white'
          )}>
            {number}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-5 h-5 text-[var(--bleu-france)]" />
              <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                {title}
              </h3>
            </div>
            <p className="text-sm text-[var(--text-mention)]">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Message d'accueil */}
      <div className="fr-alert fr-alert--info">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Bienvenue sur PGV Planning</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Ce service vous permet de planifier vos journées de travail, télétravail, formations et congés,
              puis d'exporter votre planning au format ICS compatible avec tous les calendriers (Outlook, Google Calendar, Apple Calendar).
            </p>
          </div>
        </div>
      </div>

      {/* Étapes pour démarrer */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-title)] mb-4">Comment utiliser ce service ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StepCard
            number={1}
            title="Remplir le calendrier"
            description="Sélectionnez vos jours et leur type (bureau, télétravail, formation, congés)"
            href="/calendar"
            icon={Calendar}
          />
          <StepCard
            number={2}
            title="Exporter le fichier ICS"
            description="Téléchargez le fichier à importer dans votre calendrier"
            href="/exports"
            icon={FileDown}
          />
        </div>
      </section>

      {/* Actions rapides */}
      <section>
        <h2 className="text-xl font-bold text-[var(--text-title)] mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/calendar" className="no-underline">
            <div className="fr-card fr-card--shadow hover:border-[var(--bleu-france)] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--info-bg)] flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[var(--bleu-france)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                    Modifier le calendrier
                  </h3>
                  <p className="text-sm text-[var(--text-mention)]">
                    Planifiez vos journées
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors" />
              </div>
            </div>
          </Link>
          <Link href="/exports" className="no-underline">
            <div className="fr-card fr-card--shadow hover:border-[var(--bleu-france)] transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
                  <FileDown className="w-6 h-6 text-[var(--success)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-title)] group-hover:text-[var(--bleu-france)] transition-colors">
                    Exporter en fichier ICS
                  </h3>
                  <p className="text-sm text-[var(--text-mention)]">
                    Téléchargez votre planning
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--text-disabled)] group-hover:text-[var(--bleu-france)] transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Information sur les données */}
      <section className="fr-alert fr-alert--warning">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--text-title)]">Stockage local</p>
            <p className="text-sm text-[var(--text-default)] mt-1">
              Vos données de planning sont stockées localement dans votre navigateur.
              Elles ne sont pas transmises à un serveur et restent privées.
              Pensez à exporter régulièrement votre planning pour le sauvegarder.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
