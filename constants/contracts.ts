import { EmployeeType, WorkTimeCategory } from '@/types/firestore';

export interface ContractTypeDefinition {
    id: EmployeeType;
    label: string;
    description: string;
    defaultMonthlyAllowance: number;
}

export const CONTRACT_TYPES: ContractTypeDefinition[] = [
    {
        id: 'cdi',
        label: 'CDI',
        description: 'Contrat à Durée Indéterminée',
        defaultMonthlyAllowance: 2.08, // 25j / 12
    },
    {
        id: 'cdd',
        label: 'CDD',
        description: 'Contrat à Durée Déterminée',
        defaultMonthlyAllowance: 2.08,
    },
    {
        id: 'apprentissage',
        label: 'Apprenti',
        description: "Contrat d'apprentissage",
        defaultMonthlyAllowance: 2.08,
    },
    {
        id: 'professionnalisation',
        label: 'Contrat Pro',
        description: 'Contrat de professionnalisation',
        defaultMonthlyAllowance: 2.08,
    },
    {
        id: 'stage',
        label: 'Stagiaire',
        description: 'Convention de stage',
        defaultMonthlyAllowance: 0, // Souvent pas de CP légaux, mais jours autorisés
    },
    {
        id: 'interim',
        label: 'Intérimaire',
        description: 'Géré par agence externe',
        defaultMonthlyAllowance: 0, // Payé par l'agence
    },
    {
        id: 'freelance',
        label: 'Freelance',
        description: 'Prestataire externe',
        defaultMonthlyAllowance: 0,
    },
    {
        id: 'mandataire',
        label: 'Mandataire Social',
        description: 'Dirigeants',
        defaultMonthlyAllowance: 2.08,
    },
    {
        id: 'public',
        label: 'Agent Public',
        description: 'Secteur public',
        defaultMonthlyAllowance: 2.08,
    },
    {
        id: 'vacataire',
        label: 'Vacataire',
        description: 'Prestations horaires',
        defaultMonthlyAllowance: 0,
    }
];

export interface WorkTimeCategoryDefinition {
    id: WorkTimeCategory;
    label: string;
    generatesRTT: boolean;
}

export const WORK_TIME_CATEGORIES: WorkTimeCategoryDefinition[] = [
    { id: 'temps-plein', label: 'Temps Plein (35h)', generatesRTT: false },
    { id: 'temps-partiel', label: 'Temps Partiel', generatesRTT: false },
    { id: 'forfait-jours', label: 'Forfait Jours', generatesRTT: true },
    { id: 'forfait-heures', label: 'Forfait Heures', generatesRTT: false },
];
