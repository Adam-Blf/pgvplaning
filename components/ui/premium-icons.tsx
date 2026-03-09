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
            <path fill="currentColor" fillOpacity="0.1" d="M80.999,54.435v-7.871l-8.714-2.178c-0.49-1.751-1.185-3.416-2.058-4.968l4.622-7.703l-5.566-5.566 l-7.703,4.622c-1.552-0.873-3.216-1.567-4.967-2.058L54.434,20h-7.871l-2.179,8.715c-1.75,0.49-3.414,1.184-4.965,2.058 l-7.704-4.623l-5.566,5.566l4.623,7.705c-0.873,1.551-1.567,3.215-2.057,4.965l-8.716,2.179v7.871l8.716,2.179 c0.49,1.75,1.184,3.414,2.057,4.965l-4.623,7.705l5.566,5.566l7.704-4.623c1.551,0.873,3.215,1.567,4.965,2.058L46.563,81h7.871 l2.179-8.715c1.751-0.49,3.415-1.184,4.967-2.058l7.703,4.622l5.566-5.566l-4.622-7.703c0.873-1.552,1.568-3.216,2.058-4.968 L80.999,54.435z" />
            <path fill="currentColor" d="M55.216,82h-9.434l-2.229-8.918c-1.423-0.437-2.801-1.008-4.111-1.703l-7.883,4.729l-6.669-6.669 l4.729-7.884c-0.695-1.312-1.267-2.689-1.703-4.11l-8.918-2.229v-9.434l8.918-2.229c0.437-1.421,1.008-2.799,1.703-4.11 l-4.729-7.884l6.669-6.669l7.883,4.729c1.311-0.695,2.688-1.267,4.111-1.703L45.782,19h9.434l2.229,8.917 c1.421,0.436,2.8,1.007,4.112,1.703l7.882-4.729l6.669,6.669l-4.729,7.882c0.696,1.312,1.268,2.691,1.704,4.112l8.916,2.229v9.432 l-8.916,2.229c-0.437,1.421-1.008,2.8-1.704,4.112l4.729,7.882l-6.669,6.669l-7.882-4.729c-1.312,0.696-2.691,1.268-4.112,1.703 L55.216,82z M47.344,80h6.309l2.131-8.521l0.56-0.156c1.652-0.463,3.25-1.124,4.746-1.966l0.507-0.285l7.531,4.52l4.462-4.462 l-4.52-7.532l0.285-0.507c0.842-1.494,1.504-3.091,1.967-4.745l0.156-0.56l8.521-2.13v-6.311l-8.521-2.13l-0.156-0.56 c-0.463-1.654-1.125-3.251-1.967-4.745l-0.285-0.507l4.52-7.532l-4.462-4.462l-7.531,4.52l-0.507-0.285 c-1.496-0.842-3.094-1.503-4.746-1.966l-0.56-0.156L53.653,21h-6.309l-2.131,8.522l-0.56,0.156 c-1.655,0.464-3.252,1.125-4.744,1.966l-0.507,0.285l-7.533-4.521l-4.462,4.462l4.521,7.534l-0.285,0.506 c-0.841,1.495-1.503,3.091-1.966,4.744l-0.156,0.56l-8.522,2.131v6.309l8.522,2.131l0.156,0.56c0.463,1.653,1.125,3.249,1.966,4.744 l0.285,0.506l-4.521,7.534l4.462,4.462l7.533-4.521l0.507,0.285c1.492,0.841,3.089,1.502,4.744,1.966l0.56,0.156L47.344,80z" />
            <path fill="currentColor" opacity="0.5" d="M50.5,62.999c-6.893,0-12.5-5.607-12.5-12.5s5.607-12.5,12.5-12.5S63,43.606,63,50.499 S57.392,62.999,50.5,62.999z M50.5,39.999c-5.79,0-10.5,4.71-10.5,10.5s4.71,10.5,10.5,10.5s10.5-4.71,10.5-10.5 S56.29,39.999,50.5,39.999z" />
        </svg>
    ),

    // Security / Admin (Icons8 Cadenas)
    Security: ({ className }: IconProps) => (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path fill="currentColor" fillOpacity="0.1" d="M72,42H28V82h44V42z" />
            <path fill="currentColor" d="M72,83H28V41h44V83z M30,81h40V43H30V81z" />
            <path fill="currentColor" opacity="0.5" d="M50,42c-8.271,0-15-6.729-15-15s6.729-15,15-15s15,6.729,15,15s-6.729,15-15,15z M50,14 c-7.168,0-13,5.832-13,13s5.832,13,13,13s13-5.832,13-13s-5.832-13-13-13z" />
            <rect width="4" height="10" x="48" y="55" fill="currentColor" />
        </svg>
    ),

    // Crown / SuperAdmin (Icons8 Couronne)
    Admin: ({ className }: IconProps) => (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <path fill="currentColor" fillOpacity="0.1" d="M50,75H20l10-40l20,10l20-10l10,40H50z" />
            <path fill="currentColor" d="M82,34L70,40L50,30L30,40L18,34l12,48h40L82,34z M32.5,78l-8.5-34l12.5,6.25L50,41.25l13.5,8.75l12.5-6.25l-8.5,34H32.5z" />
            <circle cx="50" cy="25" r="3" fill="currentColor" />
            <circle cx="20" cy="30" r="3" fill="currentColor" />
            <circle cx="80" cy="30" r="3" fill="currentColor" />
        </svg>
    ),

    // Members / Team (Icons8 Support/User)
    Team: ({ className }: IconProps) => (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-6 h-6", className)}>
            <circle cx="50" cy="35" r="15" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
            <path fill="currentColor" fillOpacity="0.1" d="M80,80H20c0-15,10-25,30-25s30,10,30,25z" />
            <path fill="currentColor" d="M80,81H20V79c0-14.44,9.458-24,29-24h2c19.542,0,29,9.56,29,24V81z M22,79h56 c-0.031-13.418-8.629-22-27-22h-2C30.629,57,22.031,65.582,22,79z" />
        </svg>
    )
};
