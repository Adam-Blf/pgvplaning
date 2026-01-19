'use client';

import { useState, useEffect, useCallback } from 'react';

interface LeaveInfo {
  employeeType: 'employee' | 'executive';
  employeeTypeLabel: string;
  annualLeaveDays: number;
  leaveBalance: number;
  usedDays: number;
  year: number;
  wasReset: boolean;
  team: {
    id: string;
    name: string;
  };
}

export function useLeaveInfo() {
  const [leaveInfo, setLeaveInfo] = useState<LeaveInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaveInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams/leave-info');

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

  useEffect(() => {
    fetchLeaveInfo();
  }, [fetchLeaveInfo]);

  return {
    leaveInfo,
    loading,
    error,
    refetch: fetchLeaveInfo,
  };
}
