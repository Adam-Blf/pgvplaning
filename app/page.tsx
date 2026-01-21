'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  FileDown,
  Users,
  Sparkles,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Calendar,
    title: 'Calendrier Intelligent',
    description: 'Visualisez et planifiez les absences en un coup d\'oeil',
    gradient: 'from-indigo-500 to-violet-600',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]',
    href: '/calendar',
  },
  {
    icon: Users,
    title: 'Gestion d\'Équipe',
    description: 'Coordonnez votre équipe avec des rôles et permissions',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
    href: '/team-planner',
  },
  {
    icon: FileDown,
    title: 'Export ICS',
    description: 'Compatible Google Calendar, Outlook et Apple',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]',
    href: '/exports',
  },
];

const stats = [
  { value: '2min', label: 'Setup', icon: Clock, color: 'text-amber-500' },
  { value: '100%', label: 'Sécurisé', icon: Shield, color: 'text-emerald-500' },
  { value: 'ICS', label: 'Export', icon: Zap, color: 'text-violet-500' },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        {/* Decorative Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.07] rounded-full blur-[100px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/[0.05] rounded-full blur-[80px] translate-y-1/2" />
        </div>

        <div className="relative">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4 mb-8"
          >
            <Link
              href="/calendar"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">
                Absencia Pro
              </span>
              <ChevronRight className="w-4 h-4 text-amber-500/60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent max-w-24" />
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]">
              <span className="text-[var(--text-primary)]">Gérez vos </span>
              <span className="text-gradient">absences</span>
              <br />
              <span className="text-[var(--text-primary)]">comme un </span>
              <span className="text-gradient">pro</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed"
          >
            Organisez congés, présences et télétravail de votre équipe.
            <span className="text-[var(--text-primary)] font-medium"> Exportez en ICS</span> pour tous vos calendriers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/calendar" className="group">
              <button className="btn-primary px-6 py-4 text-base">
                <CalendarDays className="w-5 h-5" />
                <span>Ouvrir le calendrier</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/exports">
              <button className="btn-secondary px-6 py-4 text-base">
                <FileDown className="w-5 h-5" />
                <span>Exporter planning</span>
              </button>
            </Link>
          </motion.div>

          {/* Quick Stats - Inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 flex items-center gap-8 md:gap-12"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden md:block w-px h-8 bg-[var(--border-subtle)] ml-8" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={feature.href} className="block group">
                  <div className={`card-interactive p-6 h-full ${feature.glow}`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg transition-transform group-hover:scale-105`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-amber-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-4 flex items-center gap-2 text-[var(--text-muted)] group-hover:text-amber-500 transition-colors">
                      <span className="text-sm font-medium">Explorer</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative"
        >
          <div className="card p-8 md:p-12 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
                  Prêt à simplifier vos plannings ?
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Rejoignez une équipe ou créez la vôtre en quelques clics.
                </p>
              </div>
              <Link href="/team/setup" className="shrink-0">
                <button className="btn-primary px-8 py-4 text-base animate-pulse-glow">
                  <Users className="w-5 h-5" />
                  <span>Commencer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
