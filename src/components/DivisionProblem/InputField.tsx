import React, { useRef } from 'react';
import type { InputFieldProps } from '../../types/division';
import Input from '../UI/Input';

const InputField: React.FC<InputFieldProps> = ({
    value,
    position,
    isActive,
    isCorrect,
    isError,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle value change - Allow empty values
    const handleChange = (newValue: string) => {
        if (newValue === '') {
            onChange(0); // or handle empty differently if needed
        } else {
            const numericValue = parseInt(newValue, 10);
            if (!isNaN(numericValue)) {
                onChange(numericValue);
            }
        }
    };

    // Handle key events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const keyboardEvent = {
            key: e.key,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
        };

        const shouldPreventDefault = onKeyDown(keyboardEvent);
        if (shouldPreventDefault === true) {
            e.preventDefault();
        }
    };

    // Determine variant based on state
    const getVariant = () => {
        if (isActive) return 'active';
        if (isError) return 'error';
        if (isCorrect) return 'correct';
        return 'default';
    };

    // Format position for aria-label
    const getAriaLabel = () => {
        const { fieldType, stepNumber, position: pos } = position;

        switch (fieldType) {
            case 'quotient':
                return `Quotient digit ${pos + 1}`;
            case 'multiply':
                return `Multiplication result for step ${stepNumber + 1}`;
            case 'subtract':
                return `Subtraction result for step ${stepNumber + 1}`;
            case 'bringDown':
                return `Bring down digit for step ${stepNumber + 1}`;
            default:
                return `Input field`;
        }
    };

    return (
        <Input
            ref={inputRef}
            value={value === null || value === 0 ? '' : value.toString()}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            variant={getVariant()}
            placeholder={placeholder || ''}
            maxLength={3}
            aria-label={getAriaLabel()}
            className="text-center font-mono"
        />
    );
};

export default InputField; 