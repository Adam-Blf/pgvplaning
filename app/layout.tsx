import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PGV Planning - Service de gestion des plannings",
  description: "Service public de génération de fichiers ICS pour vos plannings de congés et absences",
  keywords: ["planning", "congés", "ICS", "calendrier", "service public", "absences"],
  authors: [{ name: "PGV Planning" }],
  openGraph: {
    title: "PGV Planning - Service de gestion des plannings",
    description: "Service public de génération de fichiers ICS pour vos plannings de congés et absences",
    locale: "fr_FR",
    type: "website",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#000091" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#contenu"
          className="fr-sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 fr-btn"
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
              background: "var(--background-alt)",
              border: "1px solid var(--border-default)",
              color: "var(--text-default)",
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
