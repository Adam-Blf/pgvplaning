import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PGV Planning - Générateur ICS",
  description: "Générateur de fichiers ICS pour vos plannings de vacances",
  keywords: ["planning", "vacances", "ICS", "calendrier", "congés"],
  authors: [{ name: "PGV Planning" }],
  openGraph: {
    title: "PGV Planning - Générateur ICS",
    description: "Générateur de fichiers ICS pour vos plannings de vacances",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <DashboardShell>
          {children}
        </DashboardShell>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(30, 41, 59, 0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              color: "#f1f5f9",
            },
            className: "dark-toast",
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
