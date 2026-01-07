'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useContextualTheme } from '@/hooks/use-contextual-theme';

export function SpecialEvents() {
  const { specialEvent } = useContextualTheme();

  // Feux d'artifice pour le 14 juillet
  const launchFireworks = useCallback(() => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 50,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: randomInRange(0.1, 0.5),
        },
        colors: ['#0055A4', '#FFFFFF', '#EF4135'], // Bleu blanc rouge
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (specialEvent?.theme === 'bastille') {
      const cleanup = launchFireworks();
      return cleanup;
    }
  }, [specialEvent, launchFireworks]);

  if (!specialEvent) return null;

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {/* Noël - Guirlandes et flocons spéciaux */}
        {specialEvent.theme === 'christmas' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Guirlande en haut */}
            <div className="absolute top-0 left-0 right-0 h-8 flex justify-around">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: i % 3 === 0 ? '#ff0000' : i % 3 === 1 ? '#00ff00' : '#ffff00',
                    filter: 'blur(1px)',
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Halloween - Fantômes et citrouilles */}
        {specialEvent.theme === 'halloween' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Fantômes flottants */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-6xl opacity-20"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4 + i,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                👻
              </motion.div>
            ))}
            {/* Citrouilles */}
            <motion.div
              className="absolute bottom-10 left-10 text-5xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎃
            </motion.div>
            <motion.div
              className="absolute bottom-10 right-10 text-5xl"
              animate={{ scale: [1.1, 1, 1.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎃
            </motion.div>
          </motion.div>
        )}

        {/* Saint-Valentin - Coeurs flottants */}
        {specialEvent.theme === 'valentine' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl"
                style={{
                  left: `${Math.random() * 90 + 5}%`,
                }}
                initial={{ y: '110vh', opacity: 0 }}
                animate={{
                  y: '-10vh',
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  delay: i * 0.8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {i % 2 === 0 ? '❤️' : '💕'}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Nouvel An - Confettis */}
        {specialEvent.theme === 'newYear' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-4 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6'][
                    i % 5
                  ],
                }}
                initial={{ y: -20, rotate: 0 }}
                animate={{
                  y: '110vh',
                  rotate: 720,
                  x: [0, 50, -50, 0],
                }}
                transition={{
                  duration: 6 + Math.random() * 4,
                  delay: Math.random() * 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpecialEvents;
