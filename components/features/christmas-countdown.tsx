'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Snowflake, TreePine } from 'lucide-react';

export function ChristmasCountdown() {
  const [daysUntilChristmas, setDaysUntilChristmas] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let christmas = new Date(currentYear, 11, 25); // 25 décembre

      // Si Noël est passé cette année, calculer pour l'année prochaine
      if (now > christmas) {
        christmas = new Date(currentYear + 1, 11, 25);
      }

      const diffTime = christmas.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDaysUntilChristmas(diffDays);
    };

    calculateDays();

    // Recalculer chaque minute
    const interval = setInterval(calculateDays, 60000);
    return () => clearInterval(interval);
  }, []);

  // Ne pas afficher si Noël est dans plus de 60 jours
  if (daysUntilChristmas === null || daysUntilChristmas > 60) {
    return null;
  }

  // C'est Noël !
  if (daysUntilChristmas === 0) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-green-500/20 border border-red-500/30"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Gift className="w-4 h-4 text-red-400" />
        </motion.div>
        <span className="text-xs font-medium text-red-400">Joyeux Noël !</span>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <TreePine className="w-4 h-4 text-green-400" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-green-500/10 border border-red-500/20 hover:border-red-500/40 transition-all cursor-default group"
    >
      {/* Flocons de neige animés */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -10, x: Math.random() * 40 - 20 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, 30],
                  x: Math.random() * 20 - 10,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: 'easeOut',
                }}
                className="absolute -top-2 pointer-events-none"
                style={{ left: `${20 + i * 15}%` }}
              >
                <Snowflake className="w-3 h-3 text-sky-300/60" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div
        animate={isHovered ? { rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <TreePine className="w-4 h-4 text-green-400" />
      </motion.div>

      <div className="flex items-baseline gap-1">
        <motion.span
          key={daysUntilChristmas}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-green-400"
        >
          {daysUntilChristmas}
        </motion.span>
        <span className="text-[10px] text-muted-foreground">
          {daysUntilChristmas === 1 ? 'jour' : 'jours'}
        </span>
      </div>

      <motion.div
        animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Gift className="w-4 h-4 text-red-400" />
      </motion.div>

      {/* Tooltip au hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-popover border border-border shadow-lg whitespace-nowrap z-50"
          >
            <p className="text-xs text-foreground">
              Plus que <span className="font-bold text-red-400">{daysUntilChristmas}</span> {daysUntilChristmas === 1 ? 'jour' : 'jours'} avant Noël !
            </p>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-l border-t border-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
