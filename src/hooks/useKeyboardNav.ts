import { useState, useCallback } from 'react';
import type { DivisionProblem } from '../types/game';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface CurrentFocus {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
}

export function useKeyboardNav(problem: DivisionProblem | null) {
    const [currentFocus, setCurrentFocus] = useState<CurrentFocus>({
        stepNumber: 0,
        fieldType: 'quotient',
        fieldPosition: 0,
    });

    // Helper to get number of digits needed for a value
    const getDigitCount = (value: number): number => {
        return Math.max(1, value.toString().length);
    };

    // Move to next logical field
    const moveNext = useCallback(() => {
        if (!problem) return;

        setCurrentFocus(prev => {
            const { stepNumber, fieldType, fieldPosition } = prev;
            const step = problem.steps[stepNumber];

            if (fieldType === 'quotient') {
                // Move to first multiply field
                return { stepNumber, fieldType: 'multiply', fieldPosition: getDigitCount(step.multiply) - 1 };
            } else if (fieldType === 'multiply') {
                if (fieldPosition > 0) {
                    // Move to next multiply digit
                    return { stepNumber, fieldType: 'multiply', fieldPosition: fieldPosition - 1 };
                } else {
                    // Move to first subtract field
                    return { stepNumber, fieldType: 'subtract', fieldPosition: Math.max(0, getDigitCount(step.subtract) - 1) };
                }
            } else if (fieldType === 'subtract') {
                if (fieldPosition > 0) {
                    // Move to next subtract digit
                    return { stepNumber, fieldType: 'subtract', fieldPosition: fieldPosition - 1 };
                } else {
                    // Check if there's a bring down for this step
                    if (step.bringDown !== undefined) {
                        return { stepNumber, fieldType: 'bringDown', fieldPosition: 0 };
                    }
                    // Otherwise move to next step's quotient
                    if (stepNumber + 1 < problem.steps.length) {
                        return { stepNumber: stepNumber + 1, fieldType: 'quotient', fieldPosition: 0 };
                    }
                    return prev;
                }
            } else if (fieldType === 'bringDown') {
                // Move to next step's quotient
                if (stepNumber + 1 < problem.steps.length) {
                    return { stepNumber: stepNumber + 1, fieldType: 'quotient', fieldPosition: 0 };
                }
                return prev;
            }

            return prev;
        });
    }, [problem]);

    // Move to previous logical field
    const movePrevious = useCallback(() => {
        if (!problem) return;

        setCurrentFocus(prev => {
            const { stepNumber, fieldType, fieldPosition } = prev;
            const step = problem.steps[stepNumber];

            if (fieldType === 'bringDown') {
                return { stepNumber, fieldType: 'subtract', fieldPosition: 0 };
            } else if (fieldType === 'subtract') {
                const subtractDigits = getDigitCount(step.subtract);
                if (fieldPosition < subtractDigits - 1) {
                    return { stepNumber, fieldType: 'subtract', fieldPosition: fieldPosition + 1 };
                } else {
                    return { stepNumber, fieldType: 'multiply', fieldPosition: 0 };
                }
            } else if (fieldType === 'multiply') {
                const multiplyDigits = getDigitCount(step.multiply);
                if (fieldPosition < multiplyDigits - 1) {
                    return { stepNumber, fieldType: 'multiply', fieldPosition: fieldPosition + 1 };
                } else {
                    return { stepNumber, fieldType: 'quotient', fieldPosition: 0 };
                }
            } else if (fieldType === 'quotient') {
                // Move to previous step's last field
                if (stepNumber > 0) {
                    const prevStep = problem.steps[stepNumber - 1];
                    if (prevStep?.bringDown !== undefined) {
                        return { stepNumber: stepNumber - 1, fieldType: 'bringDown', fieldPosition: 0 };
                    } else {
                        return { stepNumber: stepNumber - 1, fieldType: 'subtract', fieldPosition: 0 };
                    }
                }
                return prev;
            }

            return prev;
        });
    }, [problem]);

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