'use client';

import { useMemo } from 'react';
import { CalendarData, DayStatus, isDayData } from './use-calendar-data';

export interface CalendarStats {
  work: number;
  remote: number;
  school: number;
  leave: number;
  total: number;
  percentages: {
    work: number;
    remote: number;
    school: number;
    leave: number;
  };
}

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
    `${year}-01-01`,
    `${year}-05-01`,
    `${year}-05-08`,
    `${year}-07-14`,
    `${year}-08-15`,
    `${year}-11-01`,
    `${year}-11-11`,
    `${year}-12-25`,
  ];

  const easter = getEasterDate(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 50);

  return [
    ...fixed,
    formatDateKey(easterMonday),
    formatDateKey(ascension),
    formatDateKey(pentecost),
  ];
}

export function useCalendarStats(data: CalendarData, year: number): CalendarStats {
  return useMemo(() => {
    const counts = {
      work: 0,
      remote: 0,
      school: 0,
      leave: 0,
    };

    const holidays = getFrenchHolidays(year);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const current = new Date(start);

    while (current <= end) {
      const key = formatDateKey(current);
      const dayOfWeek = current.getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Skip holidays
      if (holidays.includes(key)) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const value = data[key];

      // Helper to count a status (can be 0.5 for half-day or 1 for full day)
      const countStatus = (status: DayStatus | undefined, weight: number) => {
        if (!status) return;
        switch (status) {
          case 'WORK':
            counts.work += weight;
            break;
          case 'REMOTE':
            counts.remote += weight;
            break;
          case 'SCHOOL':
            counts.school += weight;
            break;
          case 'LEAVE':
            counts.leave += weight;
            break;
        }
      };

      if (value) {
        if (isDayData(value)) {
          // Half-day format
          countStatus(value.am || 'WORK', 0.5);
          countStatus(value.pm || 'WORK', 0.5);
        } else {
          // Legacy full-day format
          countStatus(value, 1);
        }
      } else {
        // Default to work
        counts.work++;
      }

      current.setDate(current.getDate() + 1);
    }

    const total = counts.work + counts.remote + counts.school + counts.leave || 1;

    return {
      ...counts,
      total,
      percentages: {
        work: (counts.work / total) * 100,
        remote: (counts.remote / total) * 100,
        school: (counts.school / total) * 100,
        leave: (counts.leave / total) * 100,
      },
    };
  }, [data, year]);
}
