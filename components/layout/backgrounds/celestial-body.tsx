'use client';

import { motion } from 'framer-motion';
import { useContextualTheme } from '@/hooks/use-contextual-theme';
import { useTimeAndSeason } from '@/hooks/use-time-season';

export function CelestialBody() {
  const { isNight, dayCycle } = useContextualTheme();
  const { timeInfo } = useTimeAndSeason();

  // Calculer la position basée sur l'heure (arc de cercle)
  const getPosition = () => {
    const { hours, minutes } = timeInfo;
    const totalMinutes = hours * 60 + minutes;

    // Le soleil/lune fait un arc de 6h à 20h (environ)
    let progress: number;

    if (isNight) {
      // Nuit: 21h à 5h
      if (hours >= 21) {
        progress = (totalMinutes - 21 * 60) / (8 * 60); // 21h à minuit + minuit à 5h
      } else {
        progress = (totalMinutes + 3 * 60) / (8 * 60); // Après minuit
      }
    } else {
      // Jour: 6h à 20h
      progress = Math.max(0, Math.min(1, (totalMinutes - 6 * 60) / (14 * 60)));
    }

    // Arc de cercle
    const angle = progress * Math.PI;
    const x = 10 + progress * 80; // 10% à 90% de la largeur
    const y = 80 - Math.sin(angle) * 60; // Arc inversé (bas = 80%, haut = 20%)

    return { x, y };
  };

  const position = getPosition();

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute"
        animate={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        transition={{ duration: 60, ease: 'linear' }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {isNight ? (
          // Lune
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-[0_0_60px_rgba(255,255,255,0.4)]">
              {/* Cratères */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gray-300/50" />
              <div className="absolute top-8 right-5 w-4 h-4 rounded-full bg-gray-300/40" />
              <div className="absolute bottom-5 left-6 w-2 h-2 rounded-full bg-gray-300/60" />
            </div>
            {/* Halo lunaire */}
            <div className="absolute inset-0 -m-4 rounded-full bg-white/10 blur-xl" />
          </motion.div>
        ) : (
          // Soleil
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full"
              style={{
                background:
                  dayCycle === 'dawn'
                    ? 'radial-gradient(circle, #ffeaa7 0%, #fdcb6e 50%, #f39c12 100%)'
                    : dayCycle === 'dusk'
                    ? 'radial-gradient(circle, #ff7675 0%, #d63031 50%, #c0392b 100%)'
                    : 'radial-gradient(circle, #fff9c4 0%, #fff176 50%, #ffee58 100%)',
                boxShadow:
                  dayCycle === 'day'
                    ? '0 0 80px rgba(255, 238, 88, 0.6), 0 0 120px rgba(255, 238, 88, 0.3)'
                    : '0 0 60px rgba(253, 203, 110, 0.5)',
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Rayons du soleil */}
            {dayCycle === 'day' && (
              <motion.div
                className="absolute inset-0 -m-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-yellow-300/40 to-transparent origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default CelestialBody;
