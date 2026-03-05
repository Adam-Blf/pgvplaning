import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
    className?: string;
}

/**
 * Icons8 Blueprint Style Icons
 * Hand-integrated with unique IDs for gradients to support multiple instances.
 */
export const PremiumIcons = {
    // Bureau / Work (Icons8 Mallette)
    Office: ({ className }: IconProps) => {
        const id = useId().replace(/[:]/g, '');
        return (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <path fill="var(--blueprint-500)" fillOpacity="0.1" d="M50,21c-3.749,0-12.181,0-10.861,9h3.756l0.266-1.048c0.497-1.959,2.139-3.425,4.166-3.734 C48.161,25.091,49.081,25,50,25s1.839,0.091,2.674,0.218c2.026,0.309,3.668,1.774,4.166,3.734L57.105,30h3.756 C62.181,21,53.749,21,50,21z" />
                <path fill="currentColor" opacity="0.8" d="M61.726,31h-5.398l-0.457-1.802c-0.397-1.568-1.711-2.742-3.347-2.991 c-1.797-0.275-3.251-0.275-5.046,0c-1.637,0.249-2.95,1.423-3.348,2.991L43.673,31h-5.398l-0.125-0.854 c-0.437-2.978,0.09-5.354,1.565-7.061C42.381,20,47.337,20,50,20s7.619,0,10.285,3.085c1.476,1.707,2.002,4.083,1.565,7.061 L61.726,31z M57.884,29h2.084c0.15-1.966-0.251-3.514-1.196-4.607C56.704,22,52.343,22,50,22s-6.704,0-8.771,2.393 c-0.945,1.094-1.347,2.642-1.196,4.607h2.084l0.074-0.294c0.597-2.349,2.553-4.105,4.985-4.476c1.992-0.307,3.655-0.307,5.649,0 c2.432,0.37,4.388,2.127,4.984,4.476L57.884,29z" />
                <rect width="58" height="33" x="21" y="43" fill="currentColor" fillOpacity="0.05" />
                <path fill="currentColor" d="M80,77H20V42h60V77z M22,75h56V44H22V75z" />
                <path fill="currentColor" opacity="0.3" d="M22,44v0.77L22.77,44H22z M75.21,75h1.41L78,73.62v-1.41 L75.21,75z" />
            </svg>
        );
    },

    // Télétravail / Home (Icons8 Accueil)
    Home: ({ className }: IconProps) => {
        return (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <polygon fill="currentColor" fillOpacity="0.1" points="80.998,46.557 50,18.341 19.002,46.557 23.249,50.804 27,47.39 27.001,78.934 73.001,78.934 73,47.39 76.751,50.804" />
                <path fill="currentColor" d="M74.001,80h-48L26,51.005l-2.298,2.092l-6.371-6.371L50,16.989l32.446,29.534l-6.371,6.371L74,51.005 L74.001,80z M28.001,78h44L72,46.479l4.011,3.651l3.539-3.539L50,19.693L20.228,46.794l3.539,3.539L28,46.479L28.001,78z" />
                <path fill="currentColor" opacity="0.5" d="M24.053,51.425 23.379,50.686 49.998,26.452 76.398,50.483 75.725,51.223 49.998,27.805" />
                <rect width="18" height="27" x="41" y="53" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
            </svg>
        );
    },

    // Formation / School (Icons8 Document / Education)
    Education: ({ className }: IconProps) => {
        return (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <rect width="50" height="70" x="25" y="15" fill="currentColor" fillOpacity="0.1" />
                <path fill="currentColor" d="M75,85H25V15h50V85z M27,83h46V17h-46V83z" />
                <path fill="currentColor" opacity="0.3" d="M30,30h40 M30,40h40 M30,50h40 M30,60h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    },

    // Réunion / Meeting (Icons8 Horloge)
    Meeting: ({ className }: IconProps) => {
        return (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <circle cx="50" cy="50" r="40" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M50,20V50L70,70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="2" fill="currentColor" />
            </svg>
        );
    },

    // Congés / Vacation (Icons8 Boîte)
    Vacation: ({ className }: IconProps) => {
        return (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <rect width="60" height="60" x="20" y="20" fill="currentColor" fillOpacity="0.1" />
                <path fill="currentColor" d="M80,80H20V20h60V80z M22,78h56V22H22V78z" />
                <path d="M20,20L50,50L80,20" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20,80L50,50L80,80" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        );
    },

    // Anniversaire / Birthday (Icons8 Cake refined)
    Cake: ({ className }: IconProps) => {
        return (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <path d="M20 21H4V13C4 11.3431 5.34315 10 7 10H17C18.6569 10 20 11.3431 20 13V21Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 6V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    },

    // Outils / Tools (Icons8 Caisse à outils)
    Tool: ({ className }: IconProps) => {
        return (
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
                <path fill="currentColor" fillOpacity="0.1" d="M83,74H17V30h66V74z" />
                <path fill="currentColor" d="M83,74H17V30h66V74z M19,72h62V32H19V72z" />
                <path fill="currentColor" opacity="0.5" d="M60,31 58,31 58,26 42,26 42,31 40,31 40,24 60,24" />
                <rect width="64" height="2" x="18" y="40" fill="currentColor" />
            </svg>
        );
    },

    // Eraser / Effacer
    Eraser: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path d="M7 21L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18.42 4.41L15.59 1.58C15.21 1.2 14.58 1.2 14.2 1.58L3.71 12.07C3.33 12.45 3.33 13.08 3.71 13.46L8.54 18.29C8.92 18.67 9.55 18.67 9.93 18.29L20.42 7.8C20.8 7.42 20.8 6.79 20.42 6.41L18.42 4.41Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),

    // Matin / Morning
    Sun: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18.36 5.64L16.95 7.05M7.05 16.95L5.64 18.36M18.36 18.36L16.95 16.95M7.05 7.05L5.64 5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),

    // Après-midi / Afternoon
    Moon: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),

    // Full day / Journée entière
    FullDay: ({ className }: IconProps) => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 12H21" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),

    // Search / Chercher
    Search: ({ className }: IconProps) => (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <circle cx="45" cy="45" r="25" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M63 63L85 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),

    // Settings / Paramètres
    Settings: ({ className }: IconProps) => (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <circle cx="50" cy="50" r="35" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
};
