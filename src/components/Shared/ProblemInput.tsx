import React, { forwardRef } from 'react';
import Input from '../UI/Input';

export interface ProblemField {
    columnPosition: number;
    fieldType: string;
    position?: number;
}

export interface ProblemInputProps {
    field: ProblemField;
    value: string;
    variant?: 'default' | 'active' | 'correct' | 'error';
    isSubmitted?: boolean;
    isCorrect?: boolean | null;
    onChange: (field: ProblemField, value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onClick?: (field: ProblemField) => void;
    onAutoAdvance?: () => void;
    onBackspace?: () => void;
    onEnter?: () => void;
    placeholder?: string;
    className?: string;
    small?: boolean;
}

const ProblemInput = forwardRef<HTMLInputElement, ProblemInputProps>(({
    field,
    value,
    variant = 'default',
    isSubmitted = false,
    isCorrect = null,
    onChange,
    onKeyDown,
    onClick,
    onAutoAdvance,
    onBackspace,
    onEnter,
    placeholder = '?',
    className = '',
    small = false,
    ...props
}, ref) => {
    // Determine the input variant based on submission state and correctness
    const getInputVariant = () => {
        // After submission, prioritize validation colors over active state
        if (isSubmitted && isCorrect !== null) {
            return isCorrect ? 'correct' : 'error';
        }
        return variant;
    };

    const handleChange = (inputValue: string) => {
        onChange(field, inputValue);
    };

    const handleClick = () => {
        onClick?.(field);
    };

    return (
        <Input
            ref={ref}
            value={value}
            variant={getInputVariant()}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onClick={handleClick}
            onAutoAdvance={onAutoAdvance}
            onBackspace={onBackspace}
            onEnter={onEnter}
            placeholder={placeholder}
            className={className}
            small={small}
            {...props}
        />
    );
});

ProblemInput.displayName = 'ProblemInput';

export default ProblemInput; 