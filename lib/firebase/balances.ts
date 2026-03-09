import { UserProfile, EmployeeType, SectorType } from '@/types/firestore';

/**
 * Calcule le solde initial de congés en fonction du type d'employé et du secteur.
 * Standards Absencia : 25 jours par défaut, ajustable.
 */
export function calculateInitialLeaveBalance(
    employeeType: EmployeeType,
    sector: SectorType
): number {
    // Logique métier de base
    let balance = 25; // Base légale française (5 semaines)

    if (employeeType === 'cadre') {
        balance += 2; // Bonus cadre par exemple
    }

    if (sector === 'public') {
        balance += 2; // Spécificité secteur public (RTT/Congés suppl.)
    }

    return balance;
}

/**
 * Calcule le prorata des congés pour une année incomplète.
 */
export function calculateProratedLeave(
    annualAllowance: number,
    startDate: Date
): number {
    const currentYear = new Date().getFullYear();
    if (startDate.getFullYear() < currentYear) return annualAllowance;
    if (startDate.getFullYear() > currentYear) return 0;

    const startMonth = startDate.getMonth(); // 0-11
    const remainingMonths = 12 - startMonth;

    return Math.round((annualAllowance / 12) * remainingMonths);
}
