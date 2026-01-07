'use client';

import { useState, useEffect, useCallback } from 'react';

// Séquence du Konami Code
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

/**
 * Hook pour détecter le Konami Code
 * Easter egg classique !
 */
export function useKonamiCode(onActivate: () => void): boolean {
  const [keysPressed, setKeysPressed] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isActivated) return;

      const newKeys = [...keysPressed, event.code].slice(-KONAMI_CODE.length);
      setKeysPressed(newKeys);

      // Vérifier si la séquence est complète
      if (newKeys.length === KONAMI_CODE.length) {
        const isMatch = newKeys.every((key, index) => key === KONAMI_CODE[index]);
        if (isMatch) {
          setIsActivated(true);
          onActivate();
        }
      }
    },
    [keysPressed, isActivated, onActivate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset après un délai
  useEffect(() => {
    if (keysPressed.length > 0) {
      const timeout = setTimeout(() => {
        setKeysPressed([]);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [keysPressed]);

  return isActivated;
}

export default useKonamiCode;
