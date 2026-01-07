'use client';

import { useState, useEffect, useCallback } from 'react';
import { VacationPeriod } from '@/lib/schemas/planning';

export interface HistoryItem {
  id: string;
  employeeName: string;
  periods: VacationPeriod[];
  createdAt: string;
}

const STORAGE_KEY = 'pgv-history';
const MAX_ITEMS = 20;

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'historique depuis localStorage
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Écouter les mises à jour de l'historique
  useEffect(() => {
    const handleHistoryUpdate = () => {
      loadHistory();
    };

    window.addEventListener('pgv-history-updated', handleHistoryUpdate);
    window.addEventListener('storage', handleHistoryUpdate);

    return () => {
      window.removeEventListener('pgv-history-updated', handleHistoryUpdate);
      window.removeEventListener('storage', handleHistoryUpdate);
    };
  }, [loadHistory]);

  // Ajouter un élément à l'historique
  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    window.dispatchEvent(new CustomEvent('pgv-history-updated'));
  }, []);

  // Supprimer un élément de l'historique
  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    window.dispatchEvent(new CustomEvent('pgv-history-updated'));
  }, []);

  // Vider tout l'historique
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pgv-history-updated'));
  }, []);

  // Régénérer un fichier ICS depuis l'historique
  const regenerateIcs = useCallback(async (item: HistoryItem) => {
    const response = await fetch('/api/generate-ics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeName: item.employeeName,
        periods: item.periods,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la régénération');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacances-${item.employeeName.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, []);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    regenerateIcs,
  };
}

export default useHistory;
