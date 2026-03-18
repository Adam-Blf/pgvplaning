import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroProMax() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] py-20 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/3 w-[700px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20" style={{filter:'blur(0.5px)'}} />
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-pink-500/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-gradient-to-tr from-sky-400/20 to-indigo-500/10 rounded-full blur-2xl opacity-60" />
      </div>
      {/* Animated sparkles */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center gap-3 mb-6 z-10"
      >
        <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
        <span className="text-lg font-semibold tracking-wide text-white/80 uppercase drop-shadow">Portfolio Adam Beloucif</span>
      </motion.div>
      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="text-center text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-amber-300 via-white to-sky-400 bg-clip-text text-transparent drop-shadow-xl mb-6 z-10"
      >
        Créez l’impossible.<br />
        <span className="text-white/90">Design. Code. Impact.</span>
      </motion.h1>
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="max-w-2xl text-center text-lg md:text-2xl text-white/70 font-medium mb-10 z-10"
      >
        Un portfolio nouvelle génération, pensé pour l’excellence visuelle et l’expérience utilisateur ultime. Animations, glassmorphism, typographies premium, et une vibe unique.
      </motion.p>
      {/* Call to action */}
      <motion.a
        href="#projects"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 1 }}
        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-sky-400 text-lg font-bold text-slate-900 shadow-xl hover:scale-105 hover:shadow-amber-400/30 transition-all focus:outline-none focus:ring-4 focus:ring-amber-300 z-10"
      >
        Découvrir mes projets
        <ArrowRight className="w-5 h-5" />
      </motion.a>
      {/* Hero image (optional) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="mt-16 z-10"
      >
        <Image
          src="/logo.svg"
          alt="Logo Adam Beloucif"
          width={120}
          height={120}
          className="rounded-2xl shadow-2xl border-4 border-white/20 bg-white/10 backdrop-blur-xl"
        />
      </motion.div>
    </section>
  );
}
