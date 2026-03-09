import type { Metadata } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OnboardingTutorial } from "@/components/features/onboarding-tutorial";
import { TeamProvider } from "@/contexts/team-context";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Absencia - Gestion des Absences d'Équipe",
  description: "Solution professionnelle de gestion des absences pour équipes et organisations. Gérez congés, présences, télétravail et formations. Export ICS compatible tous calendriers.",
  keywords: ["absences", "équipe", "ICS", "calendrier", "congés", "planning", "télétravail", "organisation", "RH", "gestion"],
  authors: [{ name: "Blackout Prod" }],
  openGraph: {
    title: "Absencia - Gestion des Absences d'Équipe",
    description: "Solution professionnelle de gestion des absences pour équipes et organisations",
    locale: "fr_FR",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0c1222" />
      </head>
      <body
        className={`${firaSans.variable} ${firaCode.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn"
        >
          Aller au contenu principal
        </a>
        <AuthProvider>
          <TeamProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
            <OnboardingTutorial />
          </TeamProvider>
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
