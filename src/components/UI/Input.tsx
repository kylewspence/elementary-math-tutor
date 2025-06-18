// Input.tsx - Unified Input component for all math operations
//
// Usage Examples:
// <Input value={value} onChange={setValue} maxLength={1} variant="active" ariaLabel="Quotient digit" />
// <Input value={value} onChange={setValue} maxLength={4} inputMode="numeric" pattern="[0-9]*" ariaLabel="Dividend" />
//
// Props:
// - value: string | number
// - onChange: (value: string) => void
// - onKeyDown, onEnter, onAutoAdvance, onFocus, onBlur, onClick: event handlers
// - maxLength: number (default 1)
// - inputMode, pattern, type: string (default numeric)
// - ariaLabel: string (for accessibility)
// - variant: 'default' | 'correct' | 'error' | 'active'
// - className: string
// - small: boolean
// - ...rest: all other input props

import React, { forwardRef, useEffect, useRef } from 'react';
import { UI_COLORS, GRID_CONSTANTS } from '../../utils/constants';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    variant?: 'default' | 'correct' | 'error' | 'active';
    onChange?: (value: string) => void;
    onEnter?: () => void;
    onAutoAdvance?: () => void;
    ariaLabel?: string;
    small?: boolean;
    parseValue?: (raw: string) => string; // Optional custom value parser
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    variant = 'default',
    className = '',
    onChange,
    onEnter,
    onAutoAdvance,
    onKeyDown,
    value,
    maxLength = 1,
    inputMode = 'numeric',
    pattern = '[0-9]*',
    type = 'text',
    ariaLabel,
    small = false,
    parseValue,
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
    text-center font-mono border-2 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    transition-all duration-200
    min-w-[40px] min-h-[40px]
  `.trim();

    const textSizeClass = small ? 'text-sm' : 'text-lg';

    const combinedClasses = [
        baseClasses,
        textSizeClass,
        variantClasses[variant],
        className,
    ].join(' ');

    const prevValueRef = useRef<string>('');

    useEffect(() => {
        prevValueRef.current = value != null ? String(value) : '';
    }, [value]);

    useEffect(() => {
        if (variant === 'active' && ref && typeof ref !== 'function' && ref.current) {
            const input = ref.current;
            setTimeout(() => {
                if (input === document.activeElement && input.value) {
                    input.select();
                }
            }, 10);
        }
    }, [variant, ref]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const parsed = parseValue ? parseValue(raw) : raw;
        if (onChange) onChange(parsed);
        // Do NOT auto-advance here; only in handleKeyDown
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (onKeyDown) onKeyDown(e);
        if (e.defaultPrevented) return;
        // Only auto-advance if a digit key is pressed and the field was empty before
        if (/^[0-9]$/.test(e.key) && prevValueRef.current.length === 0) {
            // Let the value update, then auto-advance
            setTimeout(() => {
                if (onAutoAdvance) onAutoAdvance();
            }, 0);
        }
        if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
            if (onAutoAdvance) onAutoAdvance();
        }
        if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowDown') && onAutoAdvance) {
            // Only auto-advance on Tab/Arrow if not Shift+Tab
            if (!(e.key === 'Tab' && e.shiftKey)) {
                onAutoAdvance();
            }
        }
        // Explicitly handle Backspace/Delete to allow clearing
        if ((e.key === 'Backspace' || e.key === 'Delete')) {
            // If the field is not already empty, call onChange with ''
            const current = prevValueRef.current;
            if (current.length > 0 && onChange) {
                onChange('');
            }
            // Do not auto-advance or prevent default
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.currentTarget.select();
        if (props.onClick) props.onClick(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value) e.target.select();
        if (props.onFocus) props.onFocus(e);
    };

    return (
        <input
            ref={ref}
            type={type}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            className={combinedClasses}
            style={{
                width: small ? `${BOX_WIDTH * 0.75}px` : `${BOX_WIDTH}px`,
                height: small ? `${BOX_HEIGHT * 0.6}px` : `${BOX_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            value={typeof value === 'number' ? value.toString() : value || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
            aria-label={ariaLabel}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input; 