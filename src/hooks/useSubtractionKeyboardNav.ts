import { useState, useCallback, useMemo } from 'react';
import type { SubtractionProblem, SubtractionUserAnswer } from '../types/subtraction';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface SubtractionCurrentFocus {
    columnPosition: number;
    fieldType: 'difference' | 'borrow';
}

export function useSubtractionKeyboardNav(problem: SubtractionProblem | null, userAnswers: SubtractionUserAnswer[] = [], isSubmitted: boolean = false) {
    // Initialize with focus on the rightmost difference digit (position 0)
    const [currentFocus, setCurrentFocus] = useState<SubtractionCurrentFocus>({
        columnPosition: 0,
        fieldType: 'difference',
    });

    // Helper function to check if a column receives a borrow - matches UI logic exactly
    const receivesBorrow = useCallback((columnPosition: number) => {
        if (!problem) return false;
        const nextStep = problem.steps.find(s => s.columnPosition === columnPosition + 1);
        return nextStep !== undefined && nextStep.borrow > 0;
    }, [problem]);

    // Get all fields that the UI actually renders - matches SubtractionDisplay exactly
    const allFields = useMemo(() => {
        if (!problem) return [];

        const fields: { columnPosition: number; fieldType: 'difference' | 'borrow' }[] = [];

        // Sort steps by column position (right to left for navigation order)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // Process each column - UI renders borrow boxes first, then difference boxes
        for (const step of orderedSteps) {
            // Add borrow field if this column receives a borrow (matches UI conditional rendering)
            if (receivesBorrow(step.columnPosition)) {
                fields.push({
                    columnPosition: step.columnPosition,
                    fieldType: 'borrow'
                });
            }

            // Add difference field for this column (UI always renders difference boxes)
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'difference'
            });
        }

        return fields;
    }, [problem, receivesBorrow]);

    // Move to the next field in the navigation order
    const moveToNextField = useCallback(() => {
        if (!problem || allFields.length === 0) return;

        // Find the current field in the ordered list
        const currentIndex = allFields.findIndex(
            field => field.columnPosition === currentFocus.columnPosition && field.fieldType === currentFocus.fieldType
        );

        // If found and not the last field, move to the next one
        if (currentIndex !== -1 && currentIndex < allFields.length - 1) {
            const nextField = allFields[currentIndex + 1];
            setCurrentFocus({
                columnPosition: nextField.columnPosition,
                fieldType: nextField.fieldType
            });
        }
    }, [problem, allFields, currentFocus]);

    // Move to the previous field in the navigation order
    const moveToPreviousField = useCallback(() => {
        if (!problem || allFields.length === 0) return;

        // Find the current field in the ordered list
        const currentIndex = allFields.findIndex(
            field => field.columnPosition === currentFocus.columnPosition && field.fieldType === currentFocus.fieldType
        );

        // If found and not the first field, move to the previous one
        if (currentIndex > 0) {
            const prevField = allFields[currentIndex - 1];
            setCurrentFocus({
                columnPosition: prevField.columnPosition,
                fieldType: prevField.fieldType
            });
        }
    }, [problem, allFields, currentFocus]);

    // Check if all fields are filled - using our own field list that matches UI
    const areAllFieldsFilled = useCallback(() => {
        if (!problem || allFields.length === 0) return false;

        // Check if we have an answer for each field that the UI actually renders
        return allFields.every(field =>
            userAnswers.some(answer =>
                answer.columnPosition === field.columnPosition &&
                answer.fieldType === field.fieldType
            )
        );
    }, [problem, allFields, userAnswers]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent, onProblemSubmit?: () => void) => {
        if (e.key === KEYBOARD_KEYS.ARROW_RIGHT || e.key === KEYBOARD_KEYS.TAB && !e.shiftKey) {
            e.preventDefault();
            moveToNextField();
        } else if (e.key === KEYBOARD_KEYS.ARROW_LEFT || (e.key === KEYBOARD_KEYS.TAB && e.shiftKey)) {
            e.preventDefault();
            moveToPreviousField();
        } else if (e.key === KEYBOARD_KEYS.ENTER) {
            if (isSubmitted) {
                // If problem is already submitted, don't prevent default
                // Let the Input component's onEnter handle it
                return;
            } else {
                e.preventDefault();
                if (onProblemSubmit && areAllFieldsFilled()) {
                    // Only submit the problem if ALL fields are filled
                    onProblemSubmit();
                }
                // If not all fields are filled, do nothing (don't advance to next field)
            }
        }
    }, [moveToNextField, moveToPreviousField, isSubmitted, areAllFieldsFilled]);

    // Jump to a specific field
    const jumpToField = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow') => {
        setCurrentFocus({
            columnPosition,
            fieldType
        });
    }, []);

    return {
        currentFocus,
        handleKeyDown,
        jumpToField,
        moveToNextField,
        moveToPreviousField,
        allFields,
        areAllFieldsFilled
    };
} 