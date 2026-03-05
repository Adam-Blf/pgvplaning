import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
    className?: string;
}

export const PremiumIcons = {
    // Bureau / Work
    Office: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <rect x="3" y="10" width="18" height="11" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 10V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),

    // Télétravail / Home
    Home: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7.5" r="1.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
    ),

    // Formation / School
    Education: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path d="M22 10L12 5L2 10L12 15L22 10Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M6 12V17C6 17 9 19 12 19C15 19 18 17 18 17V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 10V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),

    // Réunion / Meeting
    Meeting: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
    ),

    // Congés / Vacation
    Vacation: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path d="M12 2C7.02944 2 3 6.02944 3 11C3 14.5885 5.09332 17.6883 8.11718 19.1601L12 22L15.8828 19.1601C18.9067 17.6883 21 14.5885 21 11C21 6.02944 16.9706 2 12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 14V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),

    // Anniversaire / Birthday
    Cake: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path d="M20 21H4V13C4 11.3431 5.34315 10 7 10H17C18.6569 10 20 11.3431 20 13V21Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 10V7C7 6.44772 7.44772 6 8 6H16C16.5523 6 17 6.44772 17 7V10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 6V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
};
