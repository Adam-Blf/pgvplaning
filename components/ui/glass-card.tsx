'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  blur = 'md',
  padding = 'md',
  hover = true,
  glow = false,
  ...props
}: GlassCardProps) {
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyles = 'relative rounded-2xl bg-white/10 border border-white/20 shadow-xl';
  const hoverStyles = hover ? 'transition-all duration-300' : '';
  const glowStyles = glow ? 'shadow-[0_0_30px_rgba(59,130,246,0.3)]' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      className={twMerge(
        clsx(
          baseStyles,
          blurStyles[blur],
          paddingStyles[padding],
          hoverStyles,
          glowStyles
        ),
        className
      )}
      {...props}
    >
      {/* Bordure subtile en haut pour effet de lumière */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Contenu */}
      <div className="relative z-10">{children}</div>

      {/* Reflet subtil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
}

export default GlassCard;
