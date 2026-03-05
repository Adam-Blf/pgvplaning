/**
 * Utilitaires partagés
 * 
 * Fonctions utilitaires utilisées dans toute l'application.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne les classes CSS conditionnellement.
 * Combine clsx (classes conditionnelles) et tailwind-merge (résolution des conflits Tailwind).
 * 
 * @param inputs - Liste de classes CSS (chaînes, objets conditionnels, tableaux)
 * @returns Chaîne de classes CSS fusionnées et dédupliquées
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'text-white')
 * // => 'px-4 py-2 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
