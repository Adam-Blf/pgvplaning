'use client';

import { ReactNode } from 'react';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  FileDown,
  Menu,
  X,
  Activity,
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

// Routes that should not display the shell
const authRoutes = ['/login', '/auth', '/setup'];

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If on an auth route, render children only
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--border-subtle)]">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 no-underline group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-muted)] flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-[var(--accent)] rounded-xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
              </div>
              <div>
                <span className="font-[var(--font-display)] font-bold text-[var(--text-primary)] text-lg tracking-tight">
                  PGV Planning
                </span>
                <span className="hidden sm:block text-xs text-[var(--text-muted)]">
                  Gestion Hospitalière
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'nav-link',
                      isActive && 'nav-link-active'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost p-2"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-[var(--border-subtle)] animate-slideUp">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'nav-link',
                        isActive && 'nav-link-active'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1" id="contenu" role="main">
        <div className="container py-8">
          {/* Page header */}
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-2xl md:text-3xl text-[var(--text-primary)]">
              {navigation.find((n) => n.href === pathname)?.name || 'Tableau de bord'}
            </h1>
            <div className="mt-2 h-1 w-12 bg-[var(--accent)] rounded-full" />
          </div>

          {/* Page content */}
          <div className="animate-slideUp">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Blackout Prod - Solutions Hospitalières
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
