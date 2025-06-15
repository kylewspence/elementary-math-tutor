import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    FocusPosition,
    UseKeyboardNavigationReturn,
    KeyboardEvent
} from '../types/division';

export function useKeyboardNavigation(
    totalSteps: number
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

    // Create a list of all fields in proper sequential order
    const getAllFieldsInOrder = useCallback((): FocusPosition[] => {
        const allFields: FocusPosition[] = [];

        for (let stepNumber = 0; stepNumber < totalSteps; stepNumber++) {
            // Quotient - only position 0 exists for each step
            allFields.push({ fieldType: 'quotient', stepNumber, position: 0 });

            // Multiply - position 0 only (simplified for now)
            allFields.push({ fieldType: 'multiply', stepNumber, position: 0 });

            // Subtract - position 0 only (simplified for now)
            allFields.push({ fieldType: 'subtract', stepNumber, position: 0 });

            // Bring down - position 0, only if not the last step
            if (stepNumber < totalSteps - 1) {
                allFields.push({ fieldType: 'bringDown', stepNumber, position: 0 });
            }
        }

        return allFields;
    }, [totalSteps]);

    // Navigate to next field in logical order
    const nextField = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = allFields.findIndex(field =>
            field.fieldType === currentFocus.fieldType &&
            field.stepNumber === currentFocus.stepNumber &&
            field.position === currentFocus.position
        );

        if (currentIndex >= 0 && currentIndex < allFields.length - 1) {
            const nextPosition = allFields[currentIndex + 1];
            setCurrentFocus(nextPosition);
            focusField(nextPosition);
        }
        // If at the last field, stay there (do nothing)
    }, [currentFocus, getAllFieldsInOrder, focusField]);

    // Navigate to previous field
    const previousField = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = allFields.findIndex(field =>
            field.fieldType === currentFocus.fieldType &&
            field.stepNumber === currentFocus.stepNumber &&
            field.position === currentFocus.position
        );

        if (currentIndex > 0) {
            const prevPosition = allFields[currentIndex - 1];
            setCurrentFocus(prevPosition);
            focusField(prevPosition);
        }
        // If at the first field, stay there (do nothing)
    }, [currentFocus, getAllFieldsInOrder, focusField]);

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