import React, { forwardRef } from 'react';
import { UI_COLORS } from '../../utils/constants';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    variant?: 'default' | 'correct' | 'error' | 'active';
    onChange?: (value: string) => void;
    onEnter?: () => void;
    onAutoAdvance?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    variant = 'default',
    className = '',
    onChange,
    onEnter,
    onAutoAdvance,
    onKeyDown,
    ...props
}, ref) => {
    const variantClasses = {
        default: UI_COLORS.DEFAULT,
        correct: UI_COLORS.CORRECT,
        error: UI_COLORS.ERROR,
        active: UI_COLORS.ACTIVE,
    };

    const baseClasses = `
    w-12 h-12 text-center text-lg font-mono border-2 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    transition-all duration-200
  `.trim();

    const combinedClasses = [
        baseClasses,
        variantClasses[variant],
        className,
    ].join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers

        if (onChange) {
            onChange(value);

            // Auto-advance if user typed a digit
            if (value.length === 1 && onAutoAdvance) {
                setTimeout(() => {
                    onAutoAdvance();
                }, 50); // Small delay to ensure the value is processed
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
        }

        // Handle backspace/delete to clear field
        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            if (onChange) {
                onChange(''); // Clear the field
            }
        }

        if (onKeyDown) {
            onKeyDown(e);
        }
    };

    return (
        <input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className={combinedClasses}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input; 