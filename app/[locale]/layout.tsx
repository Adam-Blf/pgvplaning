import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OnboardingTutorial } from "@/components/features/onboarding-tutorial";
import { TeamProvider } from "@/contexts/team-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "../globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://absencia.beloucif.com'),
  title: {
    default: "PGV Planning - Gestion d'Équipe Universelle",
    template: "%s | PGV Planning"
  },
  description: "PGV Planning est la solution SaaS premium pour gérer plannings, absences, activités et événements de tout type d'équipe : entreprise, association, collectivité, club, groupe projet. Sécurité cloud, conformité RGPD, interface moderne.",
  keywords: [
    "gestion d'équipe",
    "planning",
    "SaaS",
    "cloud",
    "RGPD",
    "association",
    "collectivité",
    "club",
    "projet",
    "PME",
    "export ICS",
    "Adam Beloucif",
    "PGV Planning"
  ],
  authors: [{ name: "Adam Beloucif", url: "https://beloucif.com" }],
  creator: "Adam Beloucif",
  openGraph: {
    title: "PGV Planning - Gestion d'Équipe Universelle",
    description: "Gérez vos équipes, plannings et activités comme un pro. Adapté à tous secteurs, sécurité cloud, RGPD.",
    url: 'https://absencia.beloucif.com',
    siteName: 'PGV Planning',
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PGV Planning Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "PGV Planning - Gestion d'Équipe Universelle",
    description: "Gestion d'équipe, plannings et activités pour tous secteurs. Sécurité cloud, RGPD.",
    creator: "@BlackoutProd",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://absencia.beloucif.com',
    languages: {
      'fr-FR': '/fr',
      'en-US': '/en',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale;
  const children = props.children;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={cn("dark", outfit.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#0c1222" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Absencia" />
      </head>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn"
        >
          Aller au contenu principal
        </a>
        <AuthProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <TeamProvider>
              <DashboardShell>
                {children}
              </DashboardShell>
              <OnboardingTutorial />
            </TeamProvider>
          </NextIntlClientProvider>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-md)",
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
