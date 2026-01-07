'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const isLabelFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <div className="relative">
          {/* Icône optionnelle */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={twMerge(
              clsx(
                'peer w-full px-4 py-4 pt-6 text-base bg-white/10 backdrop-blur-sm border-2 rounded-xl',
                'text-foreground placeholder-transparent',
                'transition-all duration-200',
                'focus:outline-none',
                icon && 'pl-12',
                isFocused
                  ? 'border-blue-500 ring-4 ring-blue-500/20'
                  : error
                  ? 'border-red-500'
                  : 'border-white/20 hover:border-white/40',
                props.disabled && 'opacity-50 cursor-not-allowed'
              ),
              className
            )}
            placeholder={label}
          />

          {/* Label flottant */}
          <motion.label
            initial={false}
            animate={{
              y: isLabelFloating ? -12 : 0,
              scale: isLabelFloating ? 0.85 : 1,
              x: isLabelFloating ? (icon ? 48 : 16) : (icon ? 48 : 16),
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              'absolute left-0 top-1/2 -translate-y-1/2 origin-left',
              'text-gray-400 pointer-events-none',
              'transition-colors duration-200',
              isFocused && 'text-blue-500',
              error && !isFocused && 'text-red-500'
            )}
          >
            {label}
          </motion.label>

          {/* Ring animé au focus */}
          <motion.div
            initial={false}
            animate={{
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 rounded-xl ring-4 ring-blue-500/20 pointer-events-none"
          />
        </div>

        {/* Message d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 text-sm text-red-500 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
