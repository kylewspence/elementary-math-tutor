import { useState, useCallback } from 'react';
import type { DivisionProblem, UserAnswer } from '../types/game';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface CurrentFocus {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
}

export function useKeyboardNav(problem: DivisionProblem | null, userAnswers: UserAnswer[] = [], isSubmitted: boolean = false) {
    const [currentFocus, setCurrentFocus] = useState<CurrentFocus>({
        stepNumber: 0,
        fieldType: 'quotient',
        fieldPosition: 0,
    });

    // Helper to get number of digits needed for a value
    const getDigitCount = (value: number): number => {
        return Math.max(1, value.toString().length);
    };

    // Helper to check if a field has a correct answer or value
    const hasAnswerOrIsCorrect = (stepNumber: number, fieldType: string, fieldPosition: number): boolean => {
        const answer = userAnswers.find(a =>
            a.stepNumber === stepNumber &&
            a.fieldType === fieldType &&
            a.fieldPosition === fieldPosition
        );

        if (!answer) return false;

        // If submitted, only consider correct answers as "complete"
        if (isSubmitted) {
            return answer.isCorrect === true;
        }

        // If not submitted, any non-zero value counts as "filled"
        return answer.value > 0;
    };

    // Find first empty or incorrect field (always start from beginning)
    const findFirstEmptyField = useCallback((): CurrentFocus | null => {
        if (!problem) return null;

        // Create a list of all fields in order
        const allFields: CurrentFocus[] = [];

        for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
            const step = problem.steps[stepIndex];

            // Quotient
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

        // Always look for the FIRST empty/incorrect field from the beginning
        for (let i = 0; i < allFields.length; i++) {
            const field = allFields[i];
            if (!hasAnswerOrIsCorrect(field.stepNumber, field.fieldType, field.fieldPosition)) {
                return field;
            }
        }

        return null; // All fields are complete
    }, [problem, userAnswers, isSubmitted]);

    // Find previous empty or incorrect field
    const findPreviousEmptyField = useCallback((startStep: number, startFieldType: string, startFieldPosition: number): CurrentFocus | null => {
        if (!problem) return null;

        // Create a list of all fields in order (same as above)
        const allFields: CurrentFocus[] = [];

        for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
            const step = problem.steps[stepIndex];

            allFields.push({ stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 });

            const multiplyDigits = getDigitCount(step.multiply);
            for (let pos = multiplyDigits - 1; pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos });
            }

            const subtractDigits = getDigitCount(step.subtract);
            for (let pos = Math.max(0, subtractDigits - 1); pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos });
            }

            if (step.bringDown !== undefined) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 });
            }
        }

        // Find current position
        const currentIndex = allFields.findIndex(field =>
            field.stepNumber === startStep &&
            field.fieldType === startFieldType &&
            field.fieldPosition === startFieldPosition
        );

        // Look backwards for empty/incorrect field
        for (let i = currentIndex - 1; i >= 0; i--) {
            const field = allFields[i];
            if (!hasAnswerOrIsCorrect(field.stepNumber, field.fieldType, field.fieldPosition)) {
                return field;
            }
        }

        // If no empty field found before, wrap around to end
        for (let i = allFields.length - 1; i >= currentIndex; i--) {
            const field = allFields[i];
            if (!hasAnswerOrIsCorrect(field.stepNumber, field.fieldType, field.fieldPosition)) {
                return field;
            }
        }

        return null;
    }, [problem, userAnswers, isSubmitted]);

    // Smart move to first empty/incorrect field
    const moveNext = useCallback(() => {
        const firstField = findFirstEmptyField();
        if (firstField) {
            setCurrentFocus(firstField);
        }
    }, [findFirstEmptyField]);

    // Smart move to previous empty/incorrect field
    const movePrevious = useCallback(() => {
        const prevField = findPreviousEmptyField(currentFocus.stepNumber, currentFocus.fieldType, currentFocus.fieldPosition);
        if (prevField) {
            setCurrentFocus(prevField);
        }
    }, [currentFocus, findPreviousEmptyField]);

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