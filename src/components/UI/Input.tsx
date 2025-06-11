import React, { forwardRef, useEffect } from 'react';
import { UI_COLORS, GRID_CONSTANTS } from '../../utils/constants';


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
    value,
    ...props
}, ref) => {
    const variantClasses = {
        default: UI_COLORS.DEFAULT,
        correct: UI_COLORS.CORRECT,
        error: UI_COLORS.ERROR,
        active: UI_COLORS.ACTIVE,
    };

    const { BOX_WIDTH, BOX_HEIGHT } = GRID_CONSTANTS;

    const baseClasses = `
    text-center text-lg font-mono border-2 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    transition-all duration-200
  `.trim();

    const combinedClasses = [
        baseClasses,
        variantClasses[variant],
        className,
    ].join(' ');

    // Auto-select content when focused (for easy replacement)
    useEffect(() => {
        if (variant === 'active' && ref && typeof ref !== 'function' && ref.current) {
            const input = ref.current;
            // Small delay to ensure focus has completed
            setTimeout(() => {
                if (input === document.activeElement && input.value) {
                    input.select();
                }
            }, 10);
        }
    }, [variant, ref]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers

        if (onChange) {
            onChange(value);

            // Auto-advance immediately if user typed a digit
            if (value.length === 1 && onAutoAdvance) {
                onAutoAdvance();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle numeric input - if there's existing content, replace it
        if (/^[0-9]$/.test(e.key)) {
            const input = e.target as HTMLInputElement;
            if (input.value && input.selectionStart === input.selectionEnd) {
                // If there's content and nothing is selected, select all first
                input.select();
            }
        }

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

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        // Select all on click too, for better UX
        e.currentTarget.select();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Select all content when focused for easy replacement
        if (e.target.value) {
            e.target.select();
        }

        // Call original onFocus if provided
        if (props.onFocus) {
            props.onFocus(e);
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
            style={{
                width: `${BOX_WIDTH}px`,
                height: `${BOX_HEIGHT}px`,
            }}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input; 