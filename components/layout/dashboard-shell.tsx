'use client';

import { ReactNode, useMemo } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Briefcase,
  Home,
  GraduationCap,
  Palmtree,
  BarChart3,
  FileDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendarData } from '@/hooks/use-calendar-data';
import { useCalendarStats } from '@/hooks/use-calendar-stats';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface DashboardShellProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Accueil', href: '/', icon: LayoutDashboard },
  { name: 'Calendrier', href: '/calendar', icon: Calendar },
  { name: 'Statistiques', href: '/analytics', icon: BarChart3 },
  { name: 'Exporter', href: '/exports', icon: FileDown },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

const statusConfig = {
  work: { icon: Briefcase, label: 'Bureau', colorClass: 'fr-tag--blue' },
  remote: { icon: Home, label: 'Télétravail', colorClass: 'fr-tag--green' },
  school: { icon: GraduationCap, label: 'Formation', colorClass: 'fr-tag--orange' },
  leave: { icon: Palmtree, label: 'Congés', colorClass: 'fr-tag--red' },
};

// Routes qui ne doivent pas afficher le shell
const authRoutes = ['/login', '/auth', '/setup'];

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const { data, isLoaded } = useCalendarData();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const stats = useCalendarStats(data, currentYear);

  // Si on est sur une route d'authentification, afficher uniquement le contenu
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--bleu-france)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-mention)] text-sm">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header Service Public */}
      <header className="fr-header">
        <div className="fr-container">
          {/* Bande supérieure avec logo République */}
          <div className="flex items-center justify-between py-4 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-4">
              {/* Logo République Française */}
              <div className="flex flex-col">
                <div
                  className="w-12 h-2 mb-1"
                  style={{
                    background: 'linear-gradient(to right, var(--bleu-france) 0%, var(--bleu-france) 33%, white 33%, white 66%, var(--rouge-marianne) 66%)'
                  }}
                />
                <span className="text-xs font-bold text-[var(--text-title)] leading-tight">
                  RÉPUBLIQUE
                  <br />
                  FRANÇAISE
                </span>
              </div>

              {/* Séparateur vertical */}
              <div className="h-12 w-px bg-[var(--border-default)] hidden sm:block" />

              {/* Nom du service */}
              <Link href="/" className="flex items-center gap-3 no-underline">
                <div className="w-10 h-10 rounded-lg bg-[var(--bleu-france)] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-[var(--text-title)] text-lg block">
                    PGV Planning
                  </span>
                  <span className="text-[var(--text-mention)] text-xs">
                    Gestion des plannings
                  </span>
                </div>
              </Link>
            </div>

            {/* Date du jour */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--text-title)]">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Menu mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded hover:bg-[var(--background-contrast)]"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[var(--text-title)]" />
              ) : (
                <Menu className="w-6 h-6 text-[var(--text-title)]" />
              )}
            </button>
          </div>

          {/* Navigation principale */}
          <nav className={cn(
            'py-2',
            mobileMenuOpen ? 'block' : 'hidden md:block'
          )}>
            <ul className="fr-nav flex-col md:flex-row">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'fr-nav__link',
                        isActive && 'fr-nav__link--active'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Fil d'Ariane */}
      <div className="bg-[var(--background-alt)] border-b border-[var(--border-default)]">
        <div className="fr-container">
          <nav className="fr-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/" className="fr-breadcrumb__link no-underline hover:underline">
              Accueil
            </Link>
            {pathname !== '/' && (
              <>
                <span className="fr-breadcrumb__separator" aria-hidden="true">›</span>
                <span aria-current="page">
                  {navigation.find((n) => n.href === pathname)?.name || 'Page'}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="flex-1" id="contenu" role="main">
        <div className="fr-container py-6 md:py-8">
          {/* Titre de page avec statistiques rapides */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-title)]">
                {navigation.find((n) => n.href === pathname)?.name || 'Tableau de bord'}
              </h1>
              <p className="text-[var(--text-mention)] mt-1">
                Année {currentYear}
              </p>
            </div>

            {/* Statistiques rapides */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                const config = statusConfig[key];
                const Icon = config.icon;
                const value = stats[key];
                return (
                  <div
                    key={key}
                    className={cn('fr-tag', config.colorClass, 'gap-1.5')}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                    <span className="font-bold">{value}j</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contenu de la page */}
          {children}
        </div>
      </main>

      {/* Footer Service Public */}
      <footer className="fr-footer">
        <div className="fr-footer__content">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-1.5"
                style={{
                  background: 'linear-gradient(to right, var(--bleu-france) 0%, var(--bleu-france) 33%, white 33%, white 66%, var(--rouge-marianne) 66%)'
                }}
              />
              <span className="text-xs font-bold text-[var(--text-title)]">
                RÉPUBLIQUE FRANÇAISE
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="#" className="text-[var(--text-mention)] hover:text-[var(--bleu-france)] no-underline hover:underline">
                Accessibilité : partiellement conforme
              </a>
              <a href="#" className="text-[var(--text-mention)] hover:text-[var(--bleu-france)] no-underline hover:underline">
                Mentions légales
              </a>
              <a href="#" className="text-[var(--text-mention)] hover:text-[var(--bleu-france)] no-underline hover:underline">
                Données personnelles
              </a>
            </div>
          </div>
          <p className="fr-footer__text mt-4">
            Sauf mention contraire, tous les contenus de ce site sont sous{' '}
            <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener noreferrer">
              licence etalab-2.0
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
