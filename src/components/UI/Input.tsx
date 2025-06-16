import React, { forwardRef, useEffect } from 'react';
import { UI_COLORS, GRID_CONSTANTS } from '../../utils/constants';


interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    variant?: 'default' | 'correct' | 'error' | 'active';
    onChange?: (value: string) => void;
    onEnter?: () => void;
    onAutoAdvance?: () => void;
    small?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    variant = 'default',
    className = '',
    onChange,
    onEnter,
    onAutoAdvance,
    onKeyDown,
    value,
    small = false,
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
        const value = e.target.value.replace(/[^0-9]/g, '');

        if (onChange) {
            onChange(value);

            if (value.length === 1 && onAutoAdvance) {
                onAutoAdvance();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (/^[0-9]$/.test(e.key)) {
            const input = e.target as HTMLInputElement;
            if (input.value && input.selectionStart === input.selectionEnd) {
                input.select();
            }
        }

        if (onKeyDown) {
            onKeyDown(e);

            if (e.defaultPrevented) {
                return;
            }
        }

        if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            if (onChange) {
                onChange('');
            }
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.currentTarget.select();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value) {
            e.target.select();
        }

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
                width: small ? `${BOX_WIDTH * 0.75}px` : `${BOX_WIDTH}px`,
                height: small ? `${BOX_HEIGHT * 0.6}px` : `${BOX_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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