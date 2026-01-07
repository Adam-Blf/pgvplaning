'use client';

import { useState, useEffect, useMemo } from 'react';

export type DayCycle = 'dawn' | 'day' | 'dusk' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface TimeInfo {
  hours: number;
  minutes: number;
  dayCycle: DayCycle;
  dayCycleProgress: number; // 0-1 progression dans le cycle
}

export interface SeasonInfo {
  season: Season;
  seasonProgress: number; // 0-1 progression dans la saison
  daysUntilNextSeason: number;
}

// Heures de transition (approximatives pour la France)
const CYCLE_HOURS = {
  dawn: { start: 5, end: 8 },     // 5h-8h
  day: { start: 8, end: 18 },     // 8h-18h
  dusk: { start: 18, end: 21 },   // 18h-21h
  night: { start: 21, end: 5 },   // 21h-5h
};

// Dates de début des saisons (approximatives)
const SEASON_DATES = {
  spring: { month: 3, day: 20 },   // ~20 mars
  summer: { month: 6, day: 21 },   // ~21 juin
  autumn: { month: 9, day: 22 },   // ~22 septembre
  winter: { month: 12, day: 21 },  // ~21 décembre
};

function getDayCycle(hours: number): DayCycle {
  if (hours >= CYCLE_HOURS.dawn.start && hours < CYCLE_HOURS.dawn.end) {
    return 'dawn';
  }
  if (hours >= CYCLE_HOURS.day.start && hours < CYCLE_HOURS.dusk.start) {
    return 'day';
  }
  if (hours >= CYCLE_HOURS.dusk.start && hours < CYCLE_HOURS.night.start) {
    return 'dusk';
  }
  return 'night';
}

function getDayCycleProgress(hours: number, minutes: number): number {
  const totalMinutes = hours * 60 + minutes;
  const cycle = getDayCycle(hours);

  const cycleConfig = CYCLE_HOURS[cycle];
  let startMinutes = cycleConfig.start * 60;
  let endMinutes = cycleConfig.end * 60;

  // Gérer le cas de la nuit qui traverse minuit
  if (cycle === 'night') {
    if (hours >= 21) {
      startMinutes = 21 * 60;
      endMinutes = 24 * 60 + 5 * 60; // Jusqu'à 5h du lendemain
    } else {
      startMinutes = 0;
      endMinutes = 5 * 60;
      return (totalMinutes - startMinutes) / (endMinutes - startMinutes);
    }
  }

  return Math.min(1, Math.max(0, (totalMinutes - startMinutes) / (endMinutes - startMinutes)));
}

function getSeason(date: Date): Season {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    return 'spring';
  }
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 22)) {
    return 'summer';
  }
  if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day < 21)) {
    return 'autumn';
  }
  return 'winter';
}

function getSeasonProgress(date: Date): number {
  const season = getSeason(date);
  const seasonStart = SEASON_DATES[season];

  let startDate: Date;
  let endDate: Date;

  const year = date.getFullYear();

  switch (season) {
    case 'spring':
      startDate = new Date(year, seasonStart.month - 1, seasonStart.day);
      endDate = new Date(year, SEASON_DATES.summer.month - 1, SEASON_DATES.summer.day);
      break;
    case 'summer':
      startDate = new Date(year, seasonStart.month - 1, seasonStart.day);
      endDate = new Date(year, SEASON_DATES.autumn.month - 1, SEASON_DATES.autumn.day);
      break;
    case 'autumn':
      startDate = new Date(year, seasonStart.month - 1, seasonStart.day);
      endDate = new Date(year, SEASON_DATES.winter.month - 1, SEASON_DATES.winter.day);
      break;
    case 'winter':
      if (date.getMonth() === 11) {
        startDate = new Date(year, seasonStart.month - 1, seasonStart.day);
        endDate = new Date(year + 1, SEASON_DATES.spring.month - 1, SEASON_DATES.spring.day);
      } else {
        startDate = new Date(year - 1, seasonStart.month - 1, seasonStart.day);
        endDate = new Date(year, SEASON_DATES.spring.month - 1, SEASON_DATES.spring.day);
      }
      break;
  }

  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsed = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  return Math.min(1, Math.max(0, elapsed / totalDays));
}

function getDaysUntilNextSeason(date: Date): number {
  const season = getSeason(date);
  const year = date.getFullYear();

  const nextSeasonMap: Record<Season, Season> = {
    spring: 'summer',
    summer: 'autumn',
    autumn: 'winter',
    winter: 'spring',
  };

  const nextSeason = nextSeasonMap[season];
  const nextSeasonDate = SEASON_DATES[nextSeason];

  let nextDate: Date;
  if (season === 'winter' && date.getMonth() < 3) {
    nextDate = new Date(year, nextSeasonDate.month - 1, nextSeasonDate.day);
  } else if (season === 'winter') {
    nextDate = new Date(year + 1, nextSeasonDate.month - 1, nextSeasonDate.day);
  } else {
    nextDate = new Date(year, nextSeasonDate.month - 1, nextSeasonDate.day);
  }

  return Math.ceil((nextDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function useTimeAndSeason() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const timeInfo: TimeInfo = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    return {
      hours,
      minutes,
      dayCycle: getDayCycle(hours),
      dayCycleProgress: getDayCycleProgress(hours, minutes),
    };
  }, [currentTime]);

  const seasonInfo: SeasonInfo = useMemo(() => {
    return {
      season: getSeason(currentTime),
      seasonProgress: getSeasonProgress(currentTime),
      daysUntilNextSeason: getDaysUntilNextSeason(currentTime),
    };
  }, [currentTime]);

  return {
    currentTime,
    timeInfo,
    seasonInfo,
  };
}

export default useTimeAndSeason;
