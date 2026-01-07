'use client';

import React, { useId } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SparkleProps {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: React.CSSProperties;
}

const DEFAULT_COLOR = '#FFC700';

const generateSparkle = (color: string): SparkleProps => {
  return {
    id: String(Math.random()),
    createdAt: Date.now(),
    color,
    size: Math.random() * 10 + 10,
    style: {
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      zIndex: 2,
    },
  };
};

const Sparkle = ({ size, color, style }: SparkleProps) => {
  const path =
    'M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C## 51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z';

  return (
    <motion.span
      style={style}
      className="pointer-events-none absolute inline-block"
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 0],
        rotate: [0, 180],
      }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} fill={color} />
      </svg>
    </motion.span>
  );
};

interface SparklesTextProps {
  children: React.ReactNode;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

export function SparklesText({
  children,
  className,
  sparklesCount = 10,
  colors = { first: DEFAULT_COLOR, second: '#FF6B6B' },
}: SparklesTextProps) {
  const id = useId();
  const [sparkles, setSparkles] = React.useState<SparkleProps[]>([]);

  React.useEffect(() => {
    const sparklesArray = Array.from({ length: sparklesCount }, (_, i) =>
      generateSparkle(i % 2 === 0 ? colors.first : colors.second)
    );
    setSparkles(sparklesArray);
  }, [sparklesCount, colors.first, colors.second]);

  return (
    <span className={cn('relative inline-block', className)}>
      {sparkles.map((sparkle) => (
        <Sparkle key={`${id}-${sparkle.id}`} {...sparkle} />
      ))}
      <strong className="relative z-10 font-bold">{children}</strong>
    </span>
  );
}

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'random';
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  hover?: boolean;
  background?: string;
  options?: object;
}

export function SparklesCore({
  className,
  size = 1,
  minSize = null,
  density = 400,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  direction = 'random',
  opacitySpeed: _opacitySpeed = 1,
  minOpacity = null,
  color = '#FFFFFF',
  hover = false,
  background = 'transparent',
}: SparklesProps) {
  const controls = useAnimation();
  const id = useId();

  const particles = React.useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize ? Math.random() * (size - minSize) + minSize : size,
      opacity: minOpacity ? Math.random() * (opacity - minOpacity) + minOpacity : opacity,
      speed: minSpeed ? Math.random() * (speed - minSpeed) + minSpeed : speed,
    }));
  }, [density, size, minSize, opacity, minOpacity, speed, minSpeed]);

  const getDirection = () => {
    switch (direction) {
      case 'top':
        return { y: [0, -100] };
      case 'bottom':
        return { y: [0, 100] };
      case 'left':
        return { x: [0, -100] };
      case 'right':
        return { x: [0, 100] };
      default:
        return {
          x: [0, Math.random() * 200 - 100],
          y: [0, Math.random() * 200 - 100],
        };
    }
  };

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{ background }}
      onMouseEnter={() => hover && controls.start('hover')}
      onMouseLeave={() => hover && controls.start('default')}
    >
      {particles.map((particle) => (
        <motion.span
          key={`${id}-particle-${particle.id}`}
          className="absolute inline-block rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: color,
            opacity: particle.opacity,
          }}
          animate={{
            ...getDirection(),
            opacity: [particle.opacity, 0],
          }}
          transition={{
            duration: particle.speed * 10,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}
