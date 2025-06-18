import { useState, useCallback, useMemo } from 'react';

/**
 * Shared keyboard navigation hook for math problem UIs (Division, Addition, Multiplication).
 *
 * @template Field - The type representing a field (e.g., {stepNumber, fieldType, fieldPosition})
 * @param getAllFields - Function returning all fields in navigation order
 * @param options - Optional: isSubmitted, onProblemSubmit, fieldEquals (custom field comparison)
 */
export function useMathKeyboardNav<Field>(
    getAllFields: () => Field[],
    options?: {
        isSubmitted?: boolean;
        onProblemSubmit?: () => void;
        fieldEquals?: (a: Field, b: Field) => boolean;
    }
) {
    const { isSubmitted = false, fieldEquals } = options || {};

    // Default field equality: shallow compare all keys
    const defaultFieldEquals = (a: Field, b: Field) => {
        return JSON.stringify(a) === JSON.stringify(b);
    };
    const eq = fieldEquals || defaultFieldEquals;

    const allFields = useMemo(() => getAllFields(), [getAllFields]);
    const [currentFocus, setCurrentFocus] = useState<Field | null>(allFields[0] || null);

    // Find index of current field
    const getCurrentFieldIndex = useCallback(() => {
        if (!currentFocus) return -1;
        return allFields.findIndex(f => eq(f, currentFocus));
    }, [allFields, currentFocus, eq]);

    // Move to next field (with wrapping for Tab navigation)
    const moveNext = useCallback(() => {
        const idx = getCurrentFieldIndex();
        if (idx < allFields.length - 1 && idx !== -1) {
            setCurrentFocus(allFields[idx + 1]);
        } else if (allFields.length > 0) {
            setCurrentFocus(allFields[0]); // wrap
        }
    }, [allFields, getCurrentFieldIndex]);

    // Move to next field (without wrapping for auto-advance)
    const moveNextNoWrap = useCallback(() => {
        const idx = getCurrentFieldIndex();
        if (idx < allFields.length - 1 && idx !== -1) {
            setCurrentFocus(allFields[idx + 1]);
        }
        // Don't wrap - stay on current field if at end
    }, [allFields, getCurrentFieldIndex]);

    // Move to previous field
    const movePrevious = useCallback(() => {
        const idx = getCurrentFieldIndex();
        if (idx > 0) {
            setCurrentFocus(allFields[idx - 1]);
        } else if (allFields.length > 0) {
            setCurrentFocus(allFields[allFields.length - 1]); // wrap
        }
    }, [allFields, getCurrentFieldIndex]);

    // Jump to a specific field
    const jumpToField = useCallback((field: Field) => {
        setCurrentFocus(field);
    }, []);

    // Check if a field is focused
    const isFieldFocused = useCallback((field: Field) => {
        if (!currentFocus) return false;
        return eq(field, currentFocus);
    }, [currentFocus, eq]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) movePrevious();
                else moveNext();
                break;
            case 'Enter':
                // Don't prevent default - let Input component handle Enter key
                // This allows the Input's onEnter callback to work properly
                if (isSubmitted) return;
                // Don't handle Enter here - let Input component's onEnter handle it
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                moveNext();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                movePrevious();
                break;
            default:
                // Allow numbers, backspace, delete, etc.
                break;
        }
    }, [moveNext, movePrevious, isSubmitted]);

    return {
        currentFocus,
        setCurrentFocus,
        moveNext,
        moveNextNoWrap,
        movePrevious,
        jumpToField,
        isFieldFocused,
        handleKeyDown,
        allFields,
    };
} 