'use client';

import { ReactNode, useState, useMemo, useEffect, useRef } from 'react';
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
  BookOpen,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, usePathname, useRouter } from '@/i18n/routing';

import { TeamIndicator } from '@/components/features/team-indicator';
import { ChristmasCountdown } from '@/components/features/christmas-countdown';
import { OnboardingTutorial } from '@/components/features/onboarding-tutorial';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

interface DashboardShellProps {
  children: ReactNode;
                    )}
// Navigation items - some require authentication
const baseNavigation = [
  { name: 'Accueil', href: '/', icon: LayoutDashboard, requiresAuth: false },
  { name: 'Calendrier', href: '/calendar', icon: Calendar, requiresAuth: false },
  { name: 'Team Planner', href: '/team-planner', icon: Users, requiresAuth: true },
  { name: 'Membres', href: '/team/members', icon: Users, requiresAuth: true },
  { name: 'Validation', href: '/team/validation', icon: ShieldCheck, requiresAuth: true, requiresLeader: true },
  { name: 'Setup', href: '/team/setup', icon: LogIn, requiresAuth: true },
  { name: 'Exporter', href: '/exports', icon: FileDown, requiresAuth: false },
  { name: 'Guide', href: '/guide', icon: BookOpen, requiresAuth: false },
  { name: 'Paramètres', href: '/settings', icon: Settings, requiresAuth: false },
  { name: 'Analytics', href: '/analytics', icon: Activity, requiresAuth: true, requiresLeader: true },
];

// Routes that should not display the shell (auth and team setup pages)
const authRoutes = ['/login', '/auth', '/team/setup', '/team/create', '/team/join', '/invite'];

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, profile } = useAuth();
  const isLeader = profile?.role === 'leader';
  const isLeaderOrMod = profile?.role === 'leader' || profile?.role === 'moderator';

  // Filter navigation based on auth state and role
  const navigation = useMemo(() => {
    if (loading) {
      return (
        <div className="min-h-screen flex flex-col bg-background w-full">
          <OnboardingTutorial />
          {/* Header - Floating Glassmorphic avec scroll hide */}
          <div
            className={cn(
              "fixed top-0 left-0 right-0 z-50 px-2 md:px-4 transition-all duration-300 w-full",
              isNavbarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
            )}
          >
            <header className="w-full rounded-none glass-elevated border-b border-[var(--border-default)] shadow-[0_1px_20px_-5px_rgba(14,165,233,0.15)] shadow-2xl">
              <div className="px-2 md:px-4 w-full">
                <div className="flex items-center justify-between h-14 md:h-16 w-full">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-3 no-underline group">
                    <div className="relative">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[var(--blueprint-500)] to-cyan-400 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 shadow-glow-primary">
                        <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-[var(--blueprint-500)] rounded-xl opacity-0 blur-lg group-hover:opacity-40 transition-opacity duration-700" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-bold gradient-text-amber text-sm md:text-xl tracking-tighter leading-none transition-colors duration-300">
                        Absencia
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-medium uppercase tracking-[0.2em] leading-tight">
                        Planning Pro
                      </span>
                    </div>
                  </Link>

                  {/* Hamburger menu button (always visible) */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
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

              {/* Adaptative Navigation (hamburger everywhere) */}
              <div
                className={cn(
                  "border-t border-white/5 overflow-hidden transition-all duration-200 glass-elevated w-full",
                  mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
                style={{ overscrollBehavior: 'contain' }}
              >
                <div className="px-2 py-3 pb-4 w-full">
                  {/* Christmas Countdown */}
                  <div className="flex justify-center mb-3">
                    <ChristmasCountdown />
                  </div>

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

                    {/* Login link if not authenticated */}
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
                  }
                </div>
              </div>

              {/* Mobile Navigation */}
              <div
                className={cn(
                  "md:hidden border-t border-white/5 overflow-hidden transition-all duration-200 glass-elevated",
                  mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
                style={{ overscrollBehavior: 'contain' }}
              >
                    <div className="px-4 py-3 pb-4">
                      {/* Christmas Countdown for mobile */}
                      <div className="flex justify-center mb-3">
                        <ChristmasCountdown />
                      </div>

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

                        {/* Logout link for mobile if authenticated */}
                        {isAuthenticated && (
                          <button
                            type="button"
                            onClick={async () => {
                              setMobileMenuOpen(false);
                              if (auth) await signOut(auth);
                              router.push('/login');
                            }}
                            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Se déconnecter</span>
                          </button>
                        )}
                      </nav>
                    </div>
                  </div>
            </header>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Main content */}
      <main className="flex-1 w-full" id="contenu" role="main">
        <div className="w-full py-4 md:py-8 px-2 md:px-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-background/50 w-full">
        <div className="w-full py-8 md:py-12 px-2 md:px-4">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 group hover:border-[var(--blueprint-500)]/30 transition-all cursor-default">
              <Activity className="w-3.5 h-3.5 text-[var(--blueprint-500)] group-hover:animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-white transition-colors">
                Absencia par Blackout Prod
              </span>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <Link href="/guide" className="hover:text-primary transition-colors">
                Guide
              </Link>
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
