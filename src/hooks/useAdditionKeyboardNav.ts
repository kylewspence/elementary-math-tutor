import { useState, useCallback, useMemo } from 'react';
import type { AdditionProblem, AdditionUserAnswer } from '../types/addition';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface AdditionCurrentFocus {
    columnPosition: number;
    fieldType: 'sum' | 'carry';
}

export function useAdditionKeyboardNav(problem: AdditionProblem | null, userAnswers: AdditionUserAnswer[] = [], isSubmitted: boolean = false) {
    // Initialize with focus on the rightmost sum digit (position 0)
    const [currentFocus, setCurrentFocus] = useState<AdditionCurrentFocus>({
        columnPosition: 0,
        fieldType: 'sum',
    });

    // Helper function to check if a column receives a carry - matches UI logic exactly
    const receivesCarry = useCallback((columnPosition: number) => {
        if (!problem) return false;
        const previousStep = problem.steps.find(s => s.columnPosition === columnPosition - 1);
        return previousStep !== undefined && previousStep.carry > 0;
    }, [problem]);

    // Get all fields that the UI actually renders - matches AdditionDisplay exactly
    const allFields = useMemo(() => {
        if (!problem) return [];

        const fields: { columnPosition: number; fieldType: 'sum' | 'carry' }[] = [];

        // Sort steps by column position (right to left for navigation order)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // Process each column - UI renders carry boxes first, then sum boxes
        for (const step of orderedSteps) {
            // Add carry field if this column receives a carry (matches UI conditional rendering)
            if (receivesCarry(step.columnPosition)) {
                fields.push({
                    columnPosition: step.columnPosition,
                    fieldType: 'carry'
                });
            }

            // Add sum field for this column (UI always renders sum boxes)
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'sum'
            });
        }

        return fields;
    }, [problem, receivesCarry]);

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
    const jumpToField = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
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