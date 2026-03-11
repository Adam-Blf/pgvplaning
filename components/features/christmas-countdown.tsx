'use client';

import { useState, useEffect } from 'react';

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
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-green-500/20 border border-red-500/30 animate-scale-in"
      >
        <div className="animate-float">
          <Gift className="w-4 h-4 text-red-400" />
        </div>
        <span className="text-xs font-medium text-red-400">Joyeux Noël !</span>
        <div className="animate-pulse-glow">
          <TreePine className="w-4 h-4 text-green-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-green-500/10 border border-red-500/20 hover:border-red-500/40 transition-all cursor-default group animate-fade-up"
    >
      {/* Flocons de neige animés */}
      {isHovered && (
        <>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute -top-2 pointer-events-none animate-float"
              style={{ left: `${20 + i * 15}%`, animationDelay: `${i * 0.2}s` }}
            >
              <Snowflake className="w-3 h-3 text-sky-300/60" />
            </div>
          ))}
        </>
      )}

      <div className="hover:scale-105 transition-all duration-200">
        <TreePine className="w-4 h-4 text-green-400" />
      </div>

      <div className="flex items-baseline gap-1">
        <span
          key={daysUntilChristmas}
          className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-green-400 animate-scale-in"
        >
          {daysUntilChristmas}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {daysUntilChristmas === 1 ? 'jour' : 'jours'}
        </span>
      </div>

      <div className="hover:scale-105 transition-all duration-200">
        <Gift className="w-4 h-4 text-red-400" />
      </div>

      {/* Tooltip au hover */}
      {isHovered && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-popover border border-border shadow-lg whitespace-nowrap z-50 animate-fade-up"
        >
          <p className="text-xs text-foreground">
            Plus que <span className="font-bold text-red-400">{daysUntilChristmas}</span> {daysUntilChristmas === 1 ? 'jour' : 'jours'} avant Noël !
          </p>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-l border-t border-border" />
        </div>
      )}
    </div>
  );
}
