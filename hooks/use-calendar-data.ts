'use client';

import { useState, useEffect, useCallback } from 'react';

export type DayStatus = 'WORK' | 'REMOTE' | 'SCHOOL' | 'TRAINER' | 'LEAVE' | 'HOLIDAY' | 'OFF';

export type HalfDay = 'AM' | 'PM' | 'FULL';

export interface DayData {
  am?: DayStatus;
  pm?: DayStatus;
}

export interface CalendarData {
  [date: string]: DayStatus | DayData;
}

// Helper to check if a value is DayData (half-day format) or DayStatus (legacy)
export function isDayData(value: DayStatus | DayData): value is DayData {
  return typeof value === 'object' && value !== null && ('am' in value || 'pm' in value);
}

const STORAGE_KEY = 'absencia-calendar-data';

// Calcul des jours fériés français
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getFrenchHolidays(year: number): string[] {
  const fixed = [
    `${year}-01-01`, // Jour de l'An
    `${year}-05-01`, // Fête du Travail
    `${year}-05-08`, // Victoire 1945
    `${year}-07-14`, // Fête Nationale
    `${year}-08-15`, // Assomption
    `${year}-11-01`, // Toussaint
    `${year}-11-11`, // Armistice
    `${year}-12-25`, // Noël
  ];

  const easter = getEasterDate(year);

  // Lundi de Pâques (Easter + 1)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  // Ascension (Easter + 39)
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);

  // Lundi de Pentecôte (Easter + 50)
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 50);

  return [
    ...fixed,
    formatDateKey(easterMonday),
    formatDateKey(ascension),
    formatDateKey(pentecost),
  ];
}

function initializeHolidays(data: CalendarData, year: number): CalendarData {
  const holidays = getFrenchHolidays(year);
  const newData = { ...data };

  holidays.forEach((date) => {
    if (!newData[date] || newData[date] === 'WORK') {
      newData[date] = 'HOLIDAY';
    }
  });

  return newData;
}

export function useCalendarData() {
  const [data, setData] = useState<CalendarData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let loadedData: CalendarData = {};

    if (saved) {
      try {
        loadedData = JSON.parse(saved);
      } catch {
        loadedData = {};
      }
    }

    // Initialiser les jours fériés pour l'année courante et suivante
    const currentYear = new Date().getFullYear();
    loadedData = initializeHolidays(loadedData, currentYear);
    loadedData = initializeHolidays(loadedData, currentYear + 1);

    setData(loadedData);
    setIsLoaded(true);
  }, []);

  // Sauvegarder les données à chaque modification
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const setDayStatus = useCallback((date: string, status: DayStatus | null, halfDay: HalfDay = 'FULL') => {
    setData((prev) => {
      const newData = { ...prev };
      const existing = newData[date];

      if (status === null) {
        // Eraser mode
        if (halfDay === 'FULL') {
          delete newData[date];
        } else if (isDayData(existing)) {
          const updated = { ...existing };
          if (halfDay === 'AM') delete updated.am;
          if (halfDay === 'PM') delete updated.pm;
          if (!updated.am && !updated.pm) {
            delete newData[date];
          } else {
            newData[date] = updated;
          }
        }
      } else {
        // Set status
        if (halfDay === 'FULL') {
          newData[date] = status;
        } else {
          // Half-day mode
          const currentData: DayData = isDayData(existing) ? { ...existing } : {};
          if (halfDay === 'AM') {
            currentData.am = status;
          } else {
            currentData.pm = status;
          }
          newData[date] = currentData;
        }
      }
      return newData;
    });
  }, []);

  const getDayStatus = useCallback((date: Date, halfDay: HalfDay = 'FULL'): DayStatus => {
    const key = formatDateKey(date);
    const dayOfWeek = date.getDay();

    // Vérifier si c'est un jour férié
    const holidays = getFrenchHolidays(date.getFullYear());
    if (holidays.includes(key)) {
      const stored = data[key];
      if (!stored) return 'HOLIDAY';
      if (isDayData(stored)) {
        if (halfDay === 'AM') return stored.am || 'HOLIDAY';
        if (halfDay === 'PM') return stored.pm || 'HOLIDAY';
        return stored.am || stored.pm || 'HOLIDAY';
      }
      return stored as DayStatus;
    }

    // Week-end
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'OFF';
    }

    // Retourner le statut enregistré ou WORK par défaut
    const stored = data[key];
    if (!stored) return 'WORK';
    if (isDayData(stored)) {
      if (halfDay === 'AM') return stored.am || 'WORK';
      if (halfDay === 'PM') return stored.pm || 'WORK';
      // For FULL, return dominant status or first available
      if (stored.am === stored.pm) return stored.am || 'WORK';
      return stored.am || stored.pm || 'WORK';
    }
    return stored as DayStatus;
  }, [data]);

  // Get status for a specific half-day
  const getHalfDayStatus = useCallback((date: Date, halfDay: 'AM' | 'PM'): DayStatus | null => {
    const key = formatDateKey(date);
    const stored = data[key];
    if (!stored) return null;
    if (isDayData(stored)) {
      return halfDay === 'AM' ? stored.am || null : stored.pm || null;
    }
    return stored as DayStatus;
  }, [data]);

  // Check if a day has split status (different AM/PM)
  const hasSplitDay = useCallback((date: Date): boolean => {
    const key = formatDateKey(date);
    const stored = data[key];
    if (!stored || !isDayData(stored)) return false;
    return stored.am !== stored.pm && stored.am !== undefined && stored.pm !== undefined;
  }, [data]);

  const resetData = useCallback(() => {
    const currentYear = new Date().getFullYear();
    let newData: CalendarData = {};
    newData = initializeHolidays(newData, currentYear);
    newData = initializeHolidays(newData, currentYear + 1);
    setData(newData);
  }, []);

  const loadDemoData = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const newData: CalendarData = {};

    // Générer des données démo pour l'année
    const start = new Date(currentYear, 0, 1);
    const end = new Date(currentYear, 11, 31);
    const current = new Date(start);

    while (current <= end) {
      const key = formatDateKey(current);
      const dayOfWeek = current.getDay();
      const dayOfMonth = current.getDate();

      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Vendredi = Télétravail
        if (dayOfWeek === 5) {
          newData[key] = 'REMOTE';
        }
        // Première semaine du mois = Formation (simuler alternance)
        else if (dayOfMonth <= 5) {
          newData[key] = 'SCHOOL';
        }
        // Quelques jours de congés
        else if (current.getMonth() === 7 && dayOfMonth >= 10 && dayOfMonth <= 25) {
          newData[key] = 'LEAVE';
        }
      }

      current.setDate(current.getDate() + 1);
    }

    // Ajouter les jours fériés
    const withHolidays = initializeHolidays(newData, currentYear);
    setData(initializeHolidays(withHolidays, currentYear + 1));
  }, []);

  const isHoliday = useCallback((date: Date): boolean => {
    const key = formatDateKey(date);
    const holidays = getFrenchHolidays(date.getFullYear());
    return holidays.includes(key);
  }, []);

  return {
    data,
    calendarData: data,
    isLoaded,
    setDayStatus,
    getDayStatus,
    getHalfDayStatus,
    hasSplitDay,
    resetData,
    loadDemoData,
    isHoliday,
    formatDateKey,
  };
}
