/**
 * Hook de gestion des données du calendrier
 * 
 * Gère le stockage local des statuts journaliers (présence, télétravail, congés...)
 * avec support des demi-journées (AM/PM).
 * 
 * Fonctionnalités :
 * - Persistance dans localStorage
 * - Calcul automatique des jours fériés français (fixes + mobiles)
 * - Support demi-journées (matin/après-midi)
 * - Mode démo avec données générées
 * - Mode gomme pour effacer des statuts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useTeam } from '@/contexts/team-context';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

/** Statut possible pour une journée */
export type DayStatus = 'WORK' | 'REMOTE' | 'SCHOOL' | 'TRAINER' | 'LEAVE' | 'HOLIDAY' | 'OFF';

/** Indicateur de demi-journée */
export type HalfDay = 'AM' | 'PM' | 'FULL';

/** Données d'une journée en mode demi-journée */
export interface DayData {
  am?: DayStatus; // Statut du matin
  pm?: DayStatus; // Statut de l'après-midi
}

/** Structure complète du calendrier : clé = date YYYY-MM-DD */
export interface CalendarData {
  [date: string]: DayStatus | DayData;
}

/** Vérifie si une valeur est au format demi-journée (objet) ou journée complète (chaîne) */
export function isDayData(value: DayStatus | DayData): value is DayData {
  return typeof value === 'object' && value !== null && ('am' in value || 'pm' in value);
}

// Clé de stockage dans localStorage
const STORAGE_KEY = 'absencia-calendar-data';

/**
 * Calcul de la date de Pâques pour une année donnée.
 * Algorithme de Butcher-Meeus (calcul astronomique).
 */
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
  const { user, profile } = useAuth();
  const { team, members } = useTeam();
  const [data, setData] = useState<CalendarData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      let loadedData: CalendarData = {};

      // 1. Essayer de charger depuis Firestore si utilisateur connecté
      if (user && db) {
        try {
          const calendarRef = doc(db, 'calendars', user.uid);
          const snap = await getDoc(calendarRef);
          if (snap.exists()) {
            loadedData = snap.data().data || {};
          }
        } catch (error) {
          console.error('Error loading from Firestore:', error);
        }
      }

      // 2. Si vide, essayer localStorage
      if (Object.keys(loadedData).length === 0) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            loadedData = JSON.parse(saved);
          } catch {
            loadedData = {};
          }
        }
      }

      // Initialiser les jours fériés
      const currentYear = new Date().getFullYear();
      loadedData = initializeHolidays(loadedData, currentYear);
      loadedData = initializeHolidays(loadedData, currentYear + 1);

      setData(loadedData);
      setIsLoaded(true);
    };

    loadData();
  }, [user]);

  // Sauvegarder les données à chaque modification
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const setDayStatus = useCallback(async (date: string, status: DayStatus | null, halfDay: HalfDay = 'FULL') => {
    // ----------------------------------------------------------------------
    // VÉRIFICATION DE LA RÈGLE DE PRÉSENCE MINIMALE DE L'ÉQUIPE
    // On ne vérifie que si c'est une perte de présence (passage à LEAVE, HOLIDAY, SCHOOL, MEDICAL...)
    // WORK et REMOTE comptent comme "présent" (sauf mention contraire).
    // HOLIDAY, LEAVE, OFF, SCHOOL, TRAINER sont des "absences" du bureau.
    // ----------------------------------------------------------------------
    const isAbsence = status !== null && status !== 'WORK' && status !== 'REMOTE';

    // Si l'utilisateur tente de poser une absence et que l'équipe a une règle stricte
    if (isAbsence && team && team.settings?.minPresenceRequired && team.settings.minPresenceRequired > 0) {
      if (!db || !members || members.length === 0) return; // Sécurité

      try {
        let presentCount = 0;

        // On compte les autres membres de l'équipe présents ce jour-là
        for (const member of members) {
          if (member.user_id === user?.uid) continue; // on ne se compte pas soi-même

          const memberCalendarRef = doc(db, 'calendars', member.user_id);
          const memberSnap = await getDoc(memberCalendarRef);

          let memberStatus: DayStatus | DayData | undefined;
          if (memberSnap.exists()) {
            memberStatus = memberSnap.data().data[date];
          }

          // Règle de calcul simplifiée : s'il n'y a rien sur la base, il est par défaut au travail (ou OFF le weekend, mais on ne compte les présences qu'en semaine généralement).
          // S'il a explicitly posé 'WORK' ou 'REMOTE', il est présent.
          const isMemberAbsent =
            memberStatus === 'LEAVE' ||
            memberStatus === 'HOLIDAY' ||
            memberStatus === 'SCHOOL' ||
            memberStatus === 'TRAINER' ||
            (memberStatus !== undefined && isDayData(memberStatus) && (memberStatus.am === 'LEAVE' || memberStatus.pm === 'LEAVE')); // Simplification demi-journée

          if (!isMemberAbsent) {
            presentCount++;
          }
        }

        if (presentCount < team.settings.minPresenceRequired) {
          toast.error(`Demande refusée : présence minimale de ${team.settings.minPresenceRequired} personne(s) requise. Seules ${presentCount} seront présentes.`);
          return; // On bloque la mise à jour
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la présence minimale", err);
      }
    }


    // Calculer le nouvel état localement
    let nextData: CalendarData = {};

    setData((prev) => {
      const newData = { ...prev };
      const existing = newData[date];

      if (status === null) {
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
        if (halfDay === 'FULL') {
          newData[date] = status;
        } else {
          const currentData: DayData = isDayData(existing) ? { ...existing } : {};
          if (halfDay === 'AM') {
            currentData.am = status;
          } else {
            currentData.pm = status;
          }
          newData[date] = currentData;
        }
      }
      nextData = newData;
      return newData;
    });

    // Synchroniser avec Firestore si possible
    if (user && db) {
      setIsSyncing(true);
      try {
        const calendarRef = doc(db, 'calendars', user.uid);
        await setDoc(calendarRef, {
          userId: user.uid,
          data: nextData,
          updatedAt: new Date(),
        }, { merge: true });
      } catch (error) {
        console.error('Error syncing with Firestore:', error);
        toast.error('Erreur de synchronisation Cloud');
      } finally {
        setIsSyncing(false);
      }
    }
  }, [user]);

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
    isSyncing,
  };
}
