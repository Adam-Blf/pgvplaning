'use client';

import { ReactNode } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  FileDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface DashboardShellProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Accueil', href: '/', icon: LayoutDashboard },
  { name: 'Calendrier', href: '/calendar', icon: Calendar },
  { name: 'Exporter', href: '/exports', icon: FileDown },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

// Routes qui ne doivent pas afficher le shell
const authRoutes = ['/login', '/auth', '/setup'];

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Si on est sur une route d'authentification, afficher uniquement le contenu
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header Service Public */}
      <header className="fr-header">
        <div className="fr-container">
          {/* Bande supérieure */}
          <div className="flex items-center justify-between py-4 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-4">
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
          {/* Titre de page */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-title)]">
              {navigation.find((n) => n.href === pathname)?.name || 'Tableau de bord'}
            </h1>
          </div>

          {/* Contenu de la page */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="fr-footer">
        <div className="fr-footer__content">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <span className="text-sm font-bold text-[var(--text-title)]">
              Blackout Prod
            </span>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="#" className="text-[var(--text-mention)] hover:text-[var(--bleu-france)] no-underline hover:underline">
                Mentions légales
              </a>
              <a href="#" className="text-[var(--text-mention)] hover:text-[var(--bleu-france)] no-underline hover:underline">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
