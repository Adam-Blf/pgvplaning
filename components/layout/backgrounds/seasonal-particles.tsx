'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useContextualTheme } from '@/hooks/use-contextual-theme';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

export function SeasonalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const { particles: particleConfig } = useContextualTheme();

  const createParticle = useCallback(
    (canvas: HTMLCanvasElement): Particle => {
      const colors = particleConfig.colors;
      return {
        x: Math.random() * canvas.width,
        y: -20,
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * particleConfig.speed + 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.5,
        wobble: 0,
        wobbleSpeed: Math.random() * 0.1 + 0.02,
      };
    },
    [particleConfig]
  );

  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;

      switch (particleConfig.type) {
        case 'snow':
          // Flocon de neige
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          // Brillance
          ctx.beginPath();
          ctx.arc(-particle.size / 6, -particle.size / 6, particle.size / 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          break;

        case 'sakura':
          // Pétale de cerisier
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size, particle.size / 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          // Détail du pétale
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size * 0.6, particle.size / 4, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();
          break;

        case 'fireflies':
          // Luciole
          const glowSize = particle.size * (1 + Math.sin(Date.now() * 0.005 + particle.wobble) * 0.3);
          ctx.beginPath();
          ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(0.5, particle.color.replace(')', ', 0.5)').replace('rgb', 'rgba'));
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
          break;

        case 'leaves':
          // Feuille d'automne
          ctx.beginPath();
          ctx.moveTo(0, -particle.size);
          ctx.quadraticCurveTo(particle.size, -particle.size / 2, particle.size / 2, 0);
          ctx.quadraticCurveTo(particle.size, particle.size / 2, 0, particle.size);
          ctx.quadraticCurveTo(-particle.size, particle.size / 2, -particle.size / 2, 0);
          ctx.quadraticCurveTo(-particle.size, -particle.size / 2, 0, -particle.size);
          ctx.fillStyle = particle.color;
          ctx.fill();
          // Nervure
          ctx.beginPath();
          ctx.moveTo(0, -particle.size * 0.8);
          ctx.lineTo(0, particle.size * 0.8);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
      }

      ctx.restore();
    },
    [particleConfig.type]
  );

  const updateParticle = useCallback(
    (particle: Particle, canvas: HTMLCanvasElement): boolean => {
      particle.wobble += particle.wobbleSpeed;
      const wobbleX = Math.sin(particle.wobble) * 2;

      switch (particleConfig.type) {
        case 'fireflies':
          // Les lucioles bougent de façon erratique
          particle.x += Math.sin(Date.now() * 0.001 + particle.wobble) * 1.5;
          particle.y += Math.cos(Date.now() * 0.001 + particle.wobble) * 1;
          particle.opacity = 0.5 + Math.sin(Date.now() * 0.003 + particle.wobble) * 0.5;
          break;

        default:
          // Mouvement standard avec vent
          particle.x += particle.speedX + wobbleX;
          particle.y += particle.speedY;
          particle.rotation += particle.rotationSpeed;
      }

      // Reset si hors écran
      if (particle.y > canvas.height + 20 || particle.x < -20 || particle.x > canvas.width + 20) {
        particle.x = Math.random() * canvas.width;
        particle.y = -20;
        return true;
      }

      return false;
    },
    [particleConfig.type]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particleConfig.type === 'none') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialiser les particules
    particlesRef.current = Array.from({ length: particleConfig.count }, () =>
      createParticle(canvas)
    );
    // Distribuer les particules sur tout l'écran au départ
    particlesRef.current.forEach((p) => {
      p.y = Math.random() * canvas.height;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        updateParticle(particle, canvas);
        drawParticle(ctx, particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleConfig, createParticle, updateParticle, drawParticle]);

  if (particleConfig.type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-5 pointer-events-none"
      style={{ zIndex: -5 }}
    />
  );
}

export default SeasonalParticles;
