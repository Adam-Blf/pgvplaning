'use client';

import { useState, useEffect, useMemo } from 'react';
import Holidays from 'date-holidays';

export interface FrenchHoliday {
  date: Date;
  name: string;
  type: string;
}

export interface SpecialEvent {
  id: string;
  name: string;
  date: Date;
  theme: 'christmas' | 'halloween' | 'bastille' | 'valentine' | 'easter' | 'newYear' | 'default';
}

const SPECIAL_EVENTS_CONFIG = [
  { month: 12, day: 25, name: 'Noël', theme: 'christmas' as const, range: 7 },
  { month: 10, day: 31, name: 'Halloween', theme: 'halloween' as const, range: 3 },
  { month: 7, day: 14, name: 'Fête Nationale', theme: 'bastille' as const, range: 1 },
  { month: 2, day: 14, name: 'Saint-Valentin', theme: 'valentine' as const, range: 1 },
  { month: 1, day: 1, name: 'Nouvel An', theme: 'newYear' as const, range: 2 },
];

function isWithinRange(date: Date, targetMonth: number, targetDay: number, range: number): boolean {
  const target = new Date(date.getFullYear(), targetMonth - 1, targetDay);
  const diffTime = Math.abs(date.getTime() - target.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= range;
}

export function useFrenchCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<FrenchHoliday[]>([]);

  // Initialiser date-holidays pour la France
  const hd = useMemo(() => {
    const holidays = new Holidays('FR');
    return holidays;
  }, []);

  // Mettre à jour la date courante toutes les heures
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60 * 60 * 1000); // Toutes les heures

    return () => clearInterval(interval);
  }, []);

  // Charger les jours fériés de l'année courante
  useEffect(() => {
    const year = currentDate.getFullYear();
    const yearHolidays = hd.getHolidays(year);

    const formattedHolidays: FrenchHoliday[] = yearHolidays.map((h) => ({
      date: new Date(h.date),
      name: h.name,
      type: h.type,
    }));

    setHolidays(formattedHolidays);
  }, [currentDate, hd]);

  // Vérifier si aujourd'hui est un jour férié
  const isHoliday = useMemo(() => {
    const today = currentDate.toDateString();
    return holidays.some((h) => h.date.toDateString() === today);
  }, [currentDate, holidays]);

  // Obtenir le jour férié d'aujourd'hui (si applicable)
  const todayHoliday = useMemo(() => {
    const today = currentDate.toDateString();
    return holidays.find((h) => h.date.toDateString() === today);
  }, [currentDate, holidays]);

  // Détecter les événements spéciaux proches
  const currentSpecialEvent = useMemo((): SpecialEvent | null => {
    for (const event of SPECIAL_EVENTS_CONFIG) {
      if (isWithinRange(currentDate, event.month, event.day, event.range)) {
        return {
          id: event.theme,
          name: event.name,
          date: new Date(currentDate.getFullYear(), event.month - 1, event.day),
          theme: event.theme,
        };
      }
    }
    return null;
  }, [currentDate]);

  // Prochain jour férié
  const nextHoliday = useMemo(() => {
    const today = currentDate.getTime();
    const upcoming = holidays
      .filter((h) => h.date.getTime() > today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
  }, [currentDate, holidays]);

  return {
    currentDate,
    holidays,
    isHoliday,
    todayHoliday,
    currentSpecialEvent,
    nextHoliday,
  };
}

export default useFrenchCalendar;
