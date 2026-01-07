'use client';

import { useMemo } from 'react';
import { useFrenchCalendar, SpecialEvent } from './use-french-calendar';
import { useTimeAndSeason, DayCycle, Season } from './use-time-season';

export interface ColorPalette {
  skyStart: string;
  skyEnd: string;
  accent: string;
  accentLight: string;
  particleColor: string;
  textColor: string;
}

export interface ParticleConfig {
  type: 'snow' | 'sakura' | 'fireflies' | 'leaves' | 'none';
  count: number;
  speed: number;
  colors: string[];
}

export interface ContextualTheme {
  palette: ColorPalette;
  particles: ParticleConfig;
  dayCycle: DayCycle;
  season: Season;
  specialEvent: SpecialEvent | null;
  isNight: boolean;
}

// Palettes de couleurs par cycle de journée et saison
const COLOR_PALETTES: Record<Season, Record<DayCycle, ColorPalette>> = {
  spring: {
    dawn: {
      skyStart: '#fce4ec',
      skyEnd: '#f8bbd9',
      accent: '#e91e63',
      accentLight: '#f48fb1',
      particleColor: '#ffb7c5',
      textColor: '#880e4f',
    },
    day: {
      skyStart: '#81d4fa',
      skyEnd: '#b3e5fc',
      accent: '#4caf50',
      accentLight: '#81c784',
      particleColor: '#ffb7c5',
      textColor: '#1b5e20',
    },
    dusk: {
      skyStart: '#ffcc80',
      skyEnd: '#ffab91',
      accent: '#ff7043',
      accentLight: '#ffab91',
      particleColor: '#ffb7c5',
      textColor: '#bf360c',
    },
    night: {
      skyStart: '#1a237e',
      skyEnd: '#283593',
      accent: '#7c4dff',
      accentLight: '#b388ff',
      particleColor: '#e1bee7',
      textColor: '#e8eaf6',
    },
  },
  summer: {
    dawn: {
      skyStart: '#fff3e0',
      skyEnd: '#ffe0b2',
      accent: '#ff9800',
      accentLight: '#ffcc80',
      particleColor: '#fff59d',
      textColor: '#e65100',
    },
    day: {
      skyStart: '#4fc3f7',
      skyEnd: '#81d4fa',
      accent: '#00bcd4',
      accentLight: '#80deea',
      particleColor: '#fff59d',
      textColor: '#006064',
    },
    dusk: {
      skyStart: '#ff8a65',
      skyEnd: '#ffab91',
      accent: '#ff5722',
      accentLight: '#ff8a65',
      particleColor: '#ffe082',
      textColor: '#bf360c',
    },
    night: {
      skyStart: '#0d1b2a',
      skyEnd: '#1b263b',
      accent: '#ffd54f',
      accentLight: '#ffecb3',
      particleColor: '#fff176',
      textColor: '#e3f2fd',
    },
  },
  autumn: {
    dawn: {
      skyStart: '#ffe0b2',
      skyEnd: '#ffcc80',
      accent: '#ff9800',
      accentLight: '#ffb74d',
      particleColor: '#ff8a65',
      textColor: '#e65100',
    },
    day: {
      skyStart: '#90caf9',
      skyEnd: '#bbdefb',
      accent: '#f57c00',
      accentLight: '#ffb74d',
      particleColor: '#ff7043',
      textColor: '#e65100',
    },
    dusk: {
      skyStart: '#d84315',
      skyEnd: '#ff5722',
      accent: '#e64a19',
      accentLight: '#ff8a65',
      particleColor: '#ff7043',
      textColor: '#fff3e0',
    },
    night: {
      skyStart: '#1a1a2e',
      skyEnd: '#16213e',
      accent: '#ff9800',
      accentLight: '#ffb74d',
      particleColor: '#ff7043',
      textColor: '#fff3e0',
    },
  },
  winter: {
    dawn: {
      skyStart: '#e3f2fd',
      skyEnd: '#bbdefb',
      accent: '#2196f3',
      accentLight: '#64b5f6',
      particleColor: '#ffffff',
      textColor: '#0d47a1',
    },
    day: {
      skyStart: '#e1f5fe',
      skyEnd: '#b3e5fc',
      accent: '#03a9f4',
      accentLight: '#4fc3f7',
      particleColor: '#ffffff',
      textColor: '#01579b',
    },
    dusk: {
      skyStart: '#9fa8da',
      skyEnd: '#7986cb',
      accent: '#5c6bc0',
      accentLight: '#9fa8da',
      particleColor: '#e8eaf6',
      textColor: '#1a237e',
    },
    night: {
      skyStart: '#0a1628',
      skyEnd: '#1a237e',
      accent: '#7c4dff',
      accentLight: '#b388ff',
      particleColor: '#ffffff',
      textColor: '#e8eaf6',
    },
  },
};

// Configuration des particules par saison et cycle
function getParticleConfig(season: Season, dayCycle: DayCycle): ParticleConfig {
  const isNight = dayCycle === 'night';

  switch (season) {
    case 'winter':
      return {
        type: 'snow',
        count: isNight ? 80 : 100,
        speed: 1.5,
        colors: ['#ffffff', '#e3f2fd', '#bbdefb'],
      };
    case 'spring':
      return {
        type: 'sakura',
        count: isNight ? 30 : 50,
        speed: 2,
        colors: ['#ffb7c5', '#ffc1cc', '#ffd1dc'],
      };
    case 'summer':
      return {
        type: isNight ? 'fireflies' : 'none',
        count: isNight ? 40 : 0,
        speed: 0.5,
        colors: ['#fff59d', '#ffee58', '#fdd835'],
      };
    case 'autumn':
      return {
        type: 'leaves',
        count: isNight ? 20 : 40,
        speed: 2.5,
        colors: ['#ff7043', '#ff5722', '#f4511e', '#e64a19', '#d84315'],
      };
    default:
      return { type: 'none', count: 0, speed: 0, colors: [] };
  }
}

export function useContextualTheme(): ContextualTheme {
  const { currentSpecialEvent } = useFrenchCalendar();
  const { timeInfo, seasonInfo } = useTimeAndSeason();

  const theme = useMemo((): ContextualTheme => {
    const { dayCycle } = timeInfo;
    const { season } = seasonInfo;
    const isNight = dayCycle === 'night';

    // Obtenir la palette de couleurs
    const palette = COLOR_PALETTES[season][dayCycle];

    // Obtenir la configuration des particules
    let particles = getParticleConfig(season, dayCycle);

    // Surcharger pour les événements spéciaux
    if (currentSpecialEvent) {
      switch (currentSpecialEvent.theme) {
        case 'christmas':
          particles = {
            type: 'snow',
            count: 120,
            speed: 1.2,
            colors: ['#ffffff', '#e3f2fd', '#c8e6c9'],
          };
          break;
        case 'halloween':
          particles = {
            type: 'leaves',
            count: 30,
            speed: 2,
            colors: ['#ff6f00', '#ff8f00', '#ffa000'],
          };
          break;
        case 'valentine':
          particles = {
            type: 'sakura',
            count: 60,
            speed: 1.5,
            colors: ['#f48fb1', '#f06292', '#ec407a'],
          };
          break;
      }
    }

    return {
      palette,
      particles,
      dayCycle,
      season,
      specialEvent: currentSpecialEvent,
      isNight,
    };
  }, [timeInfo, seasonInfo, currentSpecialEvent]);

  return theme;
}

export default useContextualTheme;
