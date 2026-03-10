import { EmployeeType, SectorType, WorkTimeCategory } from '@/types/firestore';
import { CONTRACT_TYPES, WORK_TIME_CATEGORIES } from '@/constants/contracts';

/**
 * Calcule le solde initial de congés en fonction du type de contrat et de la catégorie de temps de travail.
 */
export function calculateInitialLeaveBalance(
    employeeType: EmployeeType,
    sector: SectorType,
    workTimeCategory: WorkTimeCategory,
    workTimePercentage: number = 100
): number {
    const contractDef = CONTRACT_TYPES.find(ct => ct.id === employeeType);
    let balance = (contractDef?.defaultMonthlyAllowance || 2.08) * 12;

    // Ajustement secteur public
    if (sector === 'public') {
        balance += 2;
    }

    // Ajustement RTT pour forfait jours
    const categoryDef = WORK_TIME_CATEGORIES.find(wtc => wtc.id === workTimeCategory);
    if (categoryDef?.generatesRTT) {
        balance += 10; // Moyenne standard RTT
    }

    // Ajustement temps partiel
    if (workTimeCategory === 'temps-partiel') {
        balance = (balance * workTimePercentage) / 100;
    }

    return Math.round(balance * 100) / 100;
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
