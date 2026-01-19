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
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Calendar,
    title: 'Calendrier Intelligent',
    description: 'Visualisez et planifiez en un coup d\'oeil',
    color: 'from-blue-500 to-blue-600',
    href: '/calendar',
  },
  {
    icon: Users,
    title: 'Gestion d\'Equipe',
    description: 'Coordonnez votre equipe efficacement',
    color: 'from-emerald-500 to-emerald-600',
    href: '/team-planner',
  },
  {
    icon: FileDown,
    title: 'Export ICS',
    description: 'Compatible tous calendriers',
    color: 'from-violet-500 to-violet-600',
    href: '/exports',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/3 rounded-full blur-2xl translate-y-1/2" />

        <div className="relative">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-500 tracking-wide uppercase">
                Planning Pro
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent max-w-32" />
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-[var(--text-primary)]">Gerez votre </span>
              <span className="text-gradient">planning</span>
              <br />
              <span className="text-[var(--text-primary)]">comme un </span>
              <span className="text-gradient">pro</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mb-8 leading-relaxed"
          >
            Organisez conges, presences et teletravail.
            <span className="text-[var(--text-primary)] font-medium"> Exportez en ICS</span> pour tous vos calendriers.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/calendar" className="group">
              <button className="flex items-center gap-3 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5">
                <Calendar className="w-5 h-5" />
                <span>Ouvrir le calendrier</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/exports" className="group">
              <button className="flex items-center gap-3 px-6 py-3.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium rounded-xl border border-[var(--border-default)] transition-all hover:-translate-y-0.5">
                <FileDown className="w-5 h-5" />
                <span>Exporter planning</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Link href={feature.href} className="block group">
                <div className="relative p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-amber-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {feature.description}
                  </p>

                  {/* Arrow */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-3 gap-6"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">2min</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Temps de setup</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">100%</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Donnees securisees</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-violet-500" />
              <span className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">ICS</span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Export universel</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
