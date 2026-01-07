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
    <div className="relative">
      {/* Couches de fond fixes */}
      <div className="fixed inset-0 pointer-events-none">
        <SkyLayer />
        <CelestialBody />
        <SeasonalParticles />
        <SpecialEvents />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default WorldWrapper;
