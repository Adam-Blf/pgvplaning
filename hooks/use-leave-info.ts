/**
 * Hook d'informations sur les congés
 * 
 * Récupère et expose les données de congés de l'utilisateur connecté :
 * - Type d'employé (employé/cadre)
 * - Solde de congés restants
 * - Jours utilisés
 * - Année en cours
 * - Informations de l'équipe
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/lib/auth-fetch';

/** Données de congés d'un membre */
interface LeaveInfo {
  employeeType: 'employee' | 'executive'; // Type : employé ou cadre
  employeeTypeLabel: string;               // Libellé affiché
  annualLeaveDays: number;                 // Jours de congés annuels accordés
  leaveBalance: number;                    // Solde restant
  usedDays: number;                        // Jours déjà utilisés
  year: number;                            // Année concernée
  wasReset: boolean;                       // true si le solde a été réinitialisé
  team: {
    id: string;
    name: string;
  };
}

export function useLeaveInfo() {
  const [leaveInfo, setLeaveInfo] = useState<LeaveInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Récupérer les informations de congés depuis l'API */
  const fetchLeaveInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/teams/leave-info');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      const data = await response.json();
      setLeaveInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchLeaveInfo();
  }, [fetchLeaveInfo]);

  return {
    leaveInfo,
    loading,
    error,
    refetch: fetchLeaveInfo, // Permet de recharger manuellement
  };
}
