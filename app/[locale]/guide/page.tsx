'use client';

import {
  BookOpen,
  Users,
  Calendar,
  Zap,
  ShieldCheck,
  Rocket,
  ChevronRight,
  PlusCircle,
  Link,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function GuidePage() {
  return (
    <div
      className="max-w-4xl mx-auto space-y-16 pb-20 px-4 stagger-children"
    >
      {/* Hero Guide */}
      <div className="text-center space-y-4 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--blueprint-500)]/10 flex items-center justify-center border border-[var(--blueprint-500)]/20 mb-6 shadow-glow-primary">
          <BookOpen className="w-8 h-8 text-[var(--blueprint-500)]" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter sm:text-6xl">
          <span className="gradient-text-amber">Guide</span> <span className="text-[var(--blueprint-500)]">Absencia.</span>
        </h1>
        <p className="text-[var(--text-tertiary)] text-lg max-w-xl mx-auto">
          Apprenez à maîtriser toutes les fonctionnalités d&apos;Absencia pour simplifier
          le quotidien de votre équipe.
        </p>
      </div>

      {/* Quick Start Steps */}
      <div className="grid md:grid-cols-3 gap-6">
        <GuideStep
          index={1}
          icon={PlusCircle}
          title="Création"
          description="Lancez votre équipe en 30 secondes chrono."
          color="blue"
        />
        <GuideStep
          index={2}
          icon={Link}
          title="Invitation"
          description="Partagez votre code secret aux membres."
          color="cyan"
        />
        <GuideStep
          index={3}
          icon={CheckCircle2}
          title="Validation"
          description="Gérez les demandes de congés en temps réel."
          color="emerald"
        />
      </div>

      {/* Detailed Sections */}
      <div className="space-y-8 animate-fade-up opacity-0" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center gap-3 border-l-4 border-[var(--blueprint-500)] pl-6">
          <h2 className="text-3xl font-black gradient-text-amber tracking-tight">Questions Fréquentes</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <GuideAccordionItem
            value="team"
            title="Comment fonctionne la gestion d'équipe ?"
            icon={Users}
          >
            Absencia repose sur un système de codes uniques à 8 caractères. En tant que créateur de l&apos;équipe, vous obtenez le rôle de Leader. Cela vous permet d&apos;accéder aux paramètres avancés et de valider les demandes de vos collaborateurs. Les membres rejoignent l&apos;équipe via le lien ou le code partagé.
          </GuideAccordionItem>

          <GuideAccordionItem
            value="leave"
            title="Comment poser mes congés ?"
            icon={Calendar}
          >
            Rendez-vous sur le calendrier, sélectionnez les dates souhaitées d&apos;un simple clic ou en glissant votre souris. Choisissez le type d&apos;absence (Congés, Télétravail, Maladie...) et validez. Votre demande apparaîtra instantanément dans le planning d&apos;équipe.
          </GuideAccordionItem>

          <GuideAccordionItem
            value="export"
            title="Puis-je synchroniser avec mon agenda perso ?"
            icon={FileDown}
          >
            Oui ! Absencia génère un lien unique iCal (RFC 5545). Vous pouvez l&apos;ajouter à Google Calendar, Outlook ou Apple Calendar pour voir vos absences et celles de votre équipe directement dans votre outil habituel.
          </GuideAccordionItem>

          <GuideAccordionItem
            value="security"
            title="Mes données sont-elles sécurisées ?"
            icon={ShieldCheck}
          >
            Absencia crypte toutes les communications et utilise Firebase pour une gestion sécurisée de l&apos;authentification et des données. Seuls les membres de votre équipe autorisés peuvent consulter le planning commun.
          </GuideAccordionItem>
        </Accordion>
      </div>

      {/* CTA Section */}
      <div
        className="p-10 rounded-[3rem] bg-gradient-to-br from-[var(--blueprint-500)]/20 via-transparent to-transparent border border-white/5 relative overflow-hidden animate-fade-up opacity-0"
        style={{ animationDelay: '160ms' }}
      >
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--blueprint-500)]/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              Prêt pour l&apos;efficacité ?
            </h3>
            <p className="text-[var(--text-tertiary)] max-w-md">
              Commencez dès aujourd&apos;hui à organiser votre équipe avec les standards Absencia.
            </p>
          </div>
          <button className="h-14 px-8 rounded-2xl bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-black shadow-lg shadow-sky-500/20 transition-all flex items-center group">
            Aller au Dashboard
            <Rocket className="w-5 h-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideStep({ index, icon: Icon, title, description, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  };

  return (
    <Card className="glass-elevated border-white/5 bg-white/[0.02] rounded-[2rem] p-6 hover:border-white/10 transition-all group">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border text-2xl font-black relative overflow-hidden", colorMap[color])}>
          <Icon className="w-6 h-6 absolute opacity-20 scale-150 -right-2 -bottom-2 rotate-12" />
          {index}
        </div>
        <h4 className="font-bold text-white text-lg tracking-tight">{title}</h4>
        <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}

function GuideAccordionItem({ value, title, icon: Icon, children }: any) {
  return (
    <AccordionItem value={value} className="border-white/5">
      <AccordionTrigger className="hover:no-underline group">
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--blueprint-500)]/10 group-hover:text-[var(--blueprint-400)] transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-[var(--text-tertiary)] leading-relaxed pl-14 pt-2 pb-6">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
