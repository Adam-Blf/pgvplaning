'use client';

import { motion } from 'framer-motion';
import { useContextualTheme } from '@/hooks/use-contextual-theme';

export function SkyLayer() {
  const { palette, dayCycle, isNight } = useContextualTheme();

  // Étoiles pour la nuit
  const stars = isNight
    ? Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      }))
    : [];

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {/* Gradient principal du ciel */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(180deg, ${palette.skyStart} 0%, ${palette.skyEnd} 100%)`,
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Couche de couleur supplémentaire pour les transitions */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity: dayCycle === 'dusk' ? 0.4 : dayCycle === 'dawn' ? 0.3 : 0,
          background:
            dayCycle === 'dusk'
              ? 'linear-gradient(180deg, #ff6b6b 0%, #feca57 50%, transparent 100%)'
              : 'linear-gradient(180deg, #ffeaa7 0%, #fab1a0 50%, transparent 100%)',
        }}
        transition={{ duration: 2 }}
      />

      {/* Étoiles (uniquement la nuit) */}
      {isNight && (
        <div className="absolute inset-0">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: star.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Nuages légers (jour et aube uniquement) */}
      {(dayCycle === 'day' || dayCycle === 'dawn') && (
        <>
          <motion.div
            className="absolute w-64 h-16 bg-white/20 rounded-full blur-xl"
            animate={{
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 120,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ top: '15%', left: '-20%' }}
          />
          <motion.div
            className="absolute w-48 h-12 bg-white/15 rounded-full blur-xl"
            animate={{
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 90,
              repeat: Infinity,
              ease: 'linear',
              delay: 30,
            }}
            style={{ top: '25%', left: '-15%' }}
          />
        </>
      )}
    </div>
  );
}

export default SkyLayer;
