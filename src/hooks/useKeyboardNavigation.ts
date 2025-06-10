import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    FocusPosition,
    UseKeyboardNavigationReturn,
    KeyboardEvent
} from '../types/division';

export function useKeyboardNavigation(
    totalSteps: number,
    quotientLength: number
): UseKeyboardNavigationReturn {
    const [currentFocus, setCurrentFocus] = useState<FocusPosition>({
        stepNumber: 0,
        fieldType: 'quotient',
        position: 0,
    });

    const fieldRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    // Generate focus key for consistent referencing
    const getFocusKey = useCallback((position: FocusPosition): string => {
        return `${position.fieldType}-${position.stepNumber}-${position.position}`;
    }, []);

    // Register field reference
    const registerField = useCallback((position: FocusPosition, element: HTMLInputElement | null) => {
        const key = getFocusKey(position);
        if (element) {
            fieldRefs.current.set(key, element);
        } else {
            fieldRefs.current.delete(key);
        }
    }, [getFocusKey]);

    // Focus a specific field
    const focusField = useCallback((position: FocusPosition) => {
        const key = getFocusKey(position);
        const element = fieldRefs.current.get(key);

        if (element) {
            element.focus();
            setCurrentFocus(position);
        }
    }, [getFocusKey]);

    // Navigate to next field in logical order
    const nextField = useCallback(() => {
        const { fieldType, stepNumber, position } = currentFocus;

        let nextPosition: FocusPosition;

        switch (fieldType) {
            case 'quotient':
                if (position < quotientLength - 1) {
                    // Next quotient position
                    nextPosition = { fieldType: 'quotient', stepNumber, position: position + 1 };
                } else {
                    // Move to multiply step
                    nextPosition = { fieldType: 'multiply', stepNumber, position: 0 };
                }
                break;

            case 'multiply':
                // Move to subtract step
                nextPosition = { fieldType: 'subtract', stepNumber, position };
                break;

            case 'subtract':
                // Move to bring down step or next quotient
                if (stepNumber < totalSteps - 1) {
                    nextPosition = { fieldType: 'bringDown', stepNumber, position };
                } else {
                    // Problem complete, stay here
                    return;
                }
                break;

            case 'bringDown':
                // Move to next quotient digit
                nextPosition = { fieldType: 'quotient', stepNumber: stepNumber + 1, position: 0 };
                break;

            default:
                return;
        }

        setCurrentFocus(nextPosition);
        focusField(nextPosition);
    }, [currentFocus, totalSteps, quotientLength, focusField]);

    // Navigate to previous field
    const previousField = useCallback(() => {
        const { fieldType, stepNumber, position } = currentFocus;

        let prevPosition: FocusPosition;

        switch (fieldType) {
            case 'quotient':
                if (position > 0) {
                    // Previous quotient position
                    prevPosition = { fieldType: 'quotient', stepNumber, position: position - 1 };
                } else if (stepNumber > 0) {
                    // Previous step's bring down
                    prevPosition = { fieldType: 'bringDown', stepNumber: stepNumber - 1, position: 0 };
                } else {
                    // Stay at first position
                    return;
                }
                break;

            case 'multiply':
                // Back to quotient
                prevPosition = { fieldType: 'quotient', stepNumber, position: quotientLength - 1 };
                break;

            case 'subtract':
                // Back to multiply
                prevPosition = { fieldType: 'multiply', stepNumber, position };
                break;

            case 'bringDown':
                // Back to subtract
                prevPosition = { fieldType: 'subtract', stepNumber, position };
                break;

            default:
                return;
        }

        setCurrentFocus(prevPosition);
        focusField(prevPosition);
    }, [currentFocus, quotientLength, focusField]);

    // Jump directly to a specific field
    const jumpToField = useCallback((position: FocusPosition) => {
        setCurrentFocus(position);
        focusField(position);
    }, [focusField]);

    // Handle keyboard events - FIXED: Allow numeric input
    const handleKeyDown = useCallback((event: KeyboardEvent): boolean => {
        const { key, shiftKey } = event;

        // Allow numeric input - DON'T prevent default for numbers
        if (/^[0-9]$/.test(key)) {
            return false; // Don't prevent default, allow typing
        }

        // Handle navigation keys
        switch (key) {
            case 'Tab':
                if (shiftKey) {
                    previousField();
                } else {
                    nextField();
                }
                return true; // Prevent default

            case 'Enter':
                nextField();
                return true; // Prevent default

            case 'ArrowDown':
            case 'ArrowRight':
                nextField();
                return true; // Prevent default

            case 'ArrowUp':
            case 'ArrowLeft':
                previousField();
                return true; // Prevent default

            case 'Backspace':
            case 'Delete':
                // Allow backspace/delete for editing
                return false; // Don't prevent default

            case 'Escape':
                // Could implement "cancel current input" logic here
                return false; // Don't prevent default

            default:
                // Block all other non-numeric keys
                return true; // Prevent default
        }
    }, [nextField, previousField]);

    // Auto-focus first field when component mounts
    useEffect(() => {
        const initialPosition: FocusPosition = {
            stepNumber: 0,
            fieldType: 'quotient',
            position: 0,
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            focusField(initialPosition);
        }, 100);

        return () => clearTimeout(timer);
    }, [focusField]);

    return {
        currentFocus,
        nextField,
        previousField,
        jumpToField,
        handleKeyDown,
        registerField,
        focusField,
    };
} 