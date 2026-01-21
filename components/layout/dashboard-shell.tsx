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
  Users,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
import { TeamIndicator } from '@/components/features/team-indicator';
import { useAuth } from '@/hooks/use-auth';

interface DashboardShellProps {
  children: ReactNode;
}

// Navigation items - some require authentication
const baseNavigation = [
  { name: 'Accueil', href: '/', icon: LayoutDashboard, requiresAuth: false },
  { name: 'Calendrier', href: '/calendar', icon: Calendar, requiresAuth: false },
  { name: 'Team Planner', href: '/team-planner', icon: Users, requiresAuth: true },
  { name: 'Exporter', href: '/exports', icon: FileDown, requiresAuth: false },
  { name: 'Paramètres', href: '/settings', icon: Settings, requiresAuth: false },
];

// Routes that should not display the shell (auth and team setup pages)
const authRoutes = ['/login', '/auth', '/setup', '/team/setup', '/team/create', '/team/join'];

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  // Filter navigation based on auth state
  const navigation = useMemo(() => {
    return baseNavigation.filter(item => !item.requiresAuth || isAuthenticated);
  }, [isAuthenticated]);

  // If on an auth route, render children only
  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Floating Glassmorphic */}
      <div className="sticky top-4 z-50 px-4 md:px-6">
        <header className="mx-auto max-w-5xl rounded-2xl glass border border-white/5 shadow-2xl shadow-black/20">
          <div className="px-4 md:px-6">
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 no-underline group">
                <div className="relative">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-glow">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-primary rounded-xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-foreground text-sm md:text-base tracking-tight leading-none group-hover:text-primary transition-colors">
                    Absencia
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation - Pill Style */}
              <nav className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Team Indicator or Login Button */}
              <div className="hidden md:flex items-center gap-4">
                {loading ? (
                  <div className="h-9 w-24 rounded-full bg-muted animate-pulse" />
                ) : isAuthenticated ? (
                  <TeamIndicator />
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Se connecter
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 px-4 py-3 pb-4 animate-slideUp">
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Login link for mobile if not authenticated */}
                {!isAuthenticated && !loading && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Se connecter</span>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </header>
      </div>

      {/* Main content */}
      <main className="flex-1 mt-6" id="contenu" role="main">
        <div className="container max-w-6xl py-4 md:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-background/50">
        <div className="container max-w-6xl py-8 md:py-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Absencia par Blackout Prod
              </span>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="/mentions-legales" className="hover:text-primary transition-colors">
                Mentions légales
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
