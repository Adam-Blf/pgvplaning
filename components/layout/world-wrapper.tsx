'use client';

import { ReactNode } from 'react';
import { SkyLayer } from './backgrounds/sky-layer';
import { CelestialBody } from './backgrounds/celestial-body';
import { SeasonalParticles } from './backgrounds/seasonal-particles';
import { SpecialEvents } from './backgrounds/special-events';

interface WorldWrapperProps {
  children: ReactNode;
}

export function WorldWrapper({ children }: WorldWrapperProps) {
  return (
    <div className="relative min-h-screen">
      {/* Couches de fond (du plus éloigné au plus proche) */}
      <SkyLayer />
      <CelestialBody />
      <SeasonalParticles />
      <SpecialEvents />

      {/* Contenu principal */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default WorldWrapper;
