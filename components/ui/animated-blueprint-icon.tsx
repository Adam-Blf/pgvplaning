'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
// @ts-ignore
import { cn } from '@/lib/utils';
import { PremiumIcons } from './premium-icons';

type IconName = keyof typeof PremiumIcons;

interface AnimatedBlueprintIconProps {
    name: IconName;
    className?: string;
    animateOnHover?: boolean;
    animateOnMount?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
};

export const AnimatedBlueprintIcon = ({
    name,
    className,
    animateOnHover = true,
    animateOnMount = true,
    size = 'md',
}: AnimatedBlueprintIconProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<any>(null);

    const runAnimation = () => {
        if (!containerRef.current) return;

        // Reset paths
        const paths = containerRef.current.querySelectorAll('path, polygon, rect, circle');

        // Anime.js Line Drawing effect
        animationRef.current = anime({
            targets: paths,
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'easeInOutSine',
            duration: 1200,
            delay: (el: any, i: number) => i * 150,
            direction: 'alternate',
            loop: false,
            autoplay: true,
            begin: (anim: any) => {
                // Ensure paths have strokes for the line drawing effect
                paths.forEach((path: any) => {
                    if (!path.getAttribute('stroke')) {
                        path.setAttribute('stroke', 'currentColor');
                        path.setAttribute('stroke-width', '1');
                    }
                });
            }
        });

        // WAAPI for the container scale/glow
        containerRef.current.animate(
            [
                { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px var(--blueprint-500))' },
                { transform: 'scale(1.1)', filter: 'drop-shadow(0 0 8px var(--blueprint-500))' },
                { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px var(--blueprint-500))' }
            ],
            {
                duration: 1000,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }
        );
    };

    useEffect(() => {
        if (animateOnMount) {
            runAnimation();
        }
    }, [name, animateOnMount]);

    const handleMouseEnter = () => {
        if (animateOnHover) {
            runAnimation();
        }
    };

    const IconComponent = PremiumIcons[name];

    if (!IconComponent) return null;

    return (
        <div
            ref={containerRef}
            className={cn(
                "inline-flex items-center justify-center transition-opacity",
                sizeMap[size],
                className
            )}
            onMouseEnter={handleMouseEnter}
        >
            <IconComponent className="w-full h-full" />
        </div>
    );
};
