// InputField.tsx - Temporary thin wrapper for migration to unified Input
// TODO: Remove after all usages are migrated to Input directly
import React, { useRef } from 'react';
import type { InputFieldProps } from '../../types/division';
import Input from '../UI/Input';

const InputField: React.FC<InputFieldProps> = ({
    value,

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

    // Let parent handle value parsing and validation
    return (
        <Input
            ref={inputRef}
            value={value === null ? '' : value.toString()}
            onChange={v => onChange(v === '' ? 0 : parseInt(v, 10))}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            variant={isActive ? 'active' : isError ? 'error' : isCorrect ? 'correct' : 'default'}
            placeholder={placeholder || ''}
            maxLength={3}
            aria-label={placeholder || ''}
            className="text-center font-mono"
        />
    );
};

export default InputField; 