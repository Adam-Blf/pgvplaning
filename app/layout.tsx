import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PGV Planning - Gestion Planning Hospitalier",
  description: "Solution professionnelle de gestion des plannings pour le secteur hospitalier. Générez vos fichiers ICS pour plannings de garde, congés et absences.",
  keywords: ["planning", "hopital", "ICS", "calendrier", "medical", "garde", "congés", "absences", "healthcare"],
  authors: [{ name: "Blackout Prod" }],
  openGraph: {
    title: "PGV Planning - Gestion Planning Hospitalier",
    description: "Solution professionnelle de gestion des plannings pour le secteur hospitalier",
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
        className={`${inter.variable} ${jakarta.variable} antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn"
        >
          Aller au contenu principal
        </a>
        <DashboardShell>
          {children}
        </DashboardShell>
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
