'use client';

import { useRef, useEffect, useCallback, RefObject } from 'react';

type AnimateOptions = {
  duration?: number;
  delay?: number;
  easing?: string;
  fill?: FillMode;
};

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Animate an element on mount with WAAPI */
export function useAnimateIn<T extends HTMLElement>(
  keyframes: Keyframe[],
  options?: AnimateOptions
): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.animate(keyframes, {
      duration: options?.duration ?? 400,
      delay: options?.delay ?? 0,
      easing: options?.easing ?? EASE_OUT,
      fill: options?.fill ?? 'both',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/** Fade-up on mount */
export function useFadeUp<T extends HTMLElement>(delay = 0) {
  return useAnimateIn<T>(
    [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 450, delay, easing: EASE_OUT }
  );
}

/** Scale-in on mount */
export function useScaleIn<T extends HTMLElement>(delay = 0) {
  return useAnimateIn<T>(
    [
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { duration: 350, delay, easing: EASE_SPRING }
  );
}

/** Stagger-animate children of a container */
export function useStaggerChildren(containerRef: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
      (children[i] as HTMLElement).animate(
        [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 350,
          delay: i * 50,
          easing: EASE_OUT,
          fill: 'both',
        }
      );
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Imperative animate helper */
export function animateEl(
  el: HTMLElement | null,
  keyframes: Keyframe[],
  options?: AnimateOptions
): Animation | undefined {
  if (!el) return;
  return el.animate(keyframes, {
    duration: options?.duration ?? 300,
    delay: options?.delay ?? 0,
    easing: options?.easing ?? EASE_OUT,
    fill: options?.fill ?? 'both',
  });
}

/** Toggle visibility with WAAPI slide animation */
export function useToggleAnimation<T extends HTMLElement>(): [
  RefObject<T | null>,
  (show: boolean) => void
] {
  const ref = useRef<T>(null);

  const toggle = useCallback((show: boolean) => {
    const el = ref.current;
    if (!el) return;
    if (show) {
      el.style.display = '';
      el.animate(
        [
          { opacity: 0, transform: 'translateY(-8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 200, easing: EASE_OUT, fill: 'forwards' }
      );
    } else {
      const anim = el.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-8px)' },
        ],
        { duration: 150, easing: 'ease-in', fill: 'forwards' }
      );
      anim.onfinish = () => { el.style.display = 'none'; };
    }
  }, []);

  return [ref, toggle];
}

export { EASE_OUT, EASE_SPRING };
