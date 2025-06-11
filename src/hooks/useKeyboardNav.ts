import { useState, useCallback } from 'react';
import type { DivisionProblem, UserAnswer } from '../types/game';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface CurrentFocus {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
}

export function useKeyboardNav(problem: DivisionProblem | null, _userAnswers: UserAnswer[] = [], _isSubmitted: boolean = false) {
    const [currentFocus, setCurrentFocus] = useState<CurrentFocus>({
        stepNumber: 0,
        fieldType: 'quotient',
        fieldPosition: 0,
    });

    // Helper to get number of digits needed for a value
    const getDigitCount = (value: number): number => {
        return Math.max(1, value.toString().length);
    };

    // Get all fields in order for navigation
    const getAllFieldsInOrder = useCallback((): CurrentFocus[] => {
        if (!problem) return [];

        const allFields: CurrentFocus[] = [];

        for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
            const step = problem.steps[stepIndex];

            // Quotient field for this step
            allFields.push({ stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 });

            // Multiply digits (right to left)
            const multiplyDigits = getDigitCount(step.multiply);
            for (let pos = multiplyDigits - 1; pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos });
            }

            // Subtract digits (right to left)
            const subtractDigits = getDigitCount(step.subtract);
            for (let pos = Math.max(0, subtractDigits - 1); pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos });
            }

            // Bring down (if exists)
            if (step.bringDown !== undefined) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 });
            }
        }

        return allFields;
    }, [problem]);

    // Helper to find index of current field in the ordered list
    const getCurrentFieldIndex = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        return allFields.findIndex(field =>
            field.stepNumber === currentFocus.stepNumber &&
            field.fieldType === currentFocus.fieldType &&
            field.fieldPosition === currentFocus.fieldPosition
        );
    }, [currentFocus, getAllFieldsInOrder]);

    // Move to next field
    const moveNext = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = getCurrentFieldIndex();

        // Move to next field regardless of whether it's empty or filled
        if (currentIndex < allFields.length - 1 && currentIndex !== -1) {
            setCurrentFocus(allFields[currentIndex + 1]);
        } else if (allFields.length > 0) {
            // Wrap around to the first field if we're at the end
            setCurrentFocus(allFields[0]);
        }
    }, [currentFocus, getAllFieldsInOrder, getCurrentFieldIndex]);

    // Move to previous field
    const movePrevious = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = getCurrentFieldIndex();

        // Move to previous field regardless of whether it's empty or filled
        if (currentIndex > 0) {
            setCurrentFocus(allFields[currentIndex - 1]);
        } else if (allFields.length > 0) {
            // Wrap around to the last field if we're at the beginning
            setCurrentFocus(allFields[allFields.length - 1]);
        }
    }, [currentFocus, getAllFieldsInOrder, getCurrentFieldIndex]);

    // Jump to specific field
    const jumpToField = useCallback((stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', fieldPosition: number = 0) => {
        if (!problem || stepNumber >= problem.steps.length) return;

        setCurrentFocus({
            stepNumber,
            fieldType,
            fieldPosition,
        });
    }, [problem]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case KEYBOARD_KEYS.TAB:
                e.preventDefault();
                if (e.shiftKey) {
                    movePrevious();
                } else {
                    moveNext();
                }
                break;
            case KEYBOARD_KEYS.ENTER:
                e.preventDefault();
                moveNext();
                break;
            case KEYBOARD_KEYS.ARROW_RIGHT:
            case KEYBOARD_KEYS.ARROW_DOWN:
                e.preventDefault();
                moveNext();
                break;
            case KEYBOARD_KEYS.ARROW_LEFT:
            case KEYBOARD_KEYS.ARROW_UP:
                e.preventDefault();
                movePrevious();
                break;
        }
    }, [moveNext, movePrevious]);

    // Check if a field is currently focused
    const isFieldFocused = useCallback((stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', fieldPosition: number = 0) => {
        return currentFocus.stepNumber === stepNumber &&
            currentFocus.fieldType === fieldType &&
            currentFocus.fieldPosition === fieldPosition;
    }, [currentFocus]);

    return {
        currentFocus,
        moveNext,
        movePrevious,
        jumpToField,
        handleKeyDown,
        isFieldFocused,
    };
} 