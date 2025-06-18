import { useState, useCallback, useMemo } from 'react';
import type { AdditionProblem, AdditionUserAnswer } from '../types/addition';
import { KEYBOARD_KEYS } from '../utils/constants';
import { useSharedValidation } from './useSharedValidation';

export interface AdditionCurrentFocus {
    columnPosition: number;
    fieldType: 'sum' | 'carry';
}

export function useAdditionKeyboardNav(problem: AdditionProblem | null, userAnswers: AdditionUserAnswer[] = [], isSubmitted: boolean = false) {
    const { areAllFieldsFilled: checkAllFieldsFilled } = useSharedValidation();
    // Initialize with focus on the rightmost sum digit (position 0)
    const [currentFocus, setCurrentFocus] = useState<AdditionCurrentFocus>({
        columnPosition: 0,
        fieldType: 'sum',
    });

    // Check if we need an extra box for the final carry
    // This happens when the sum has more digits than either addend
    const hasExtraBox = useMemo(() => {
        if (!problem) return false;

        // If sum has more digits than the max number of digits in addends
        const maxAddendDigits = Math.max(
            problem.addend1.toString().length,
            problem.addend2.toString().length
        );

        return problem.sum > Math.pow(10, maxAddendDigits) - 1;
    }, [problem]);

    // Get all fields in the order they should be navigated
    const allFields = useMemo(() => {
        if (!problem) return [];

        const fields: { columnPosition: number; fieldType: 'sum' | 'carry' }[] = [];

        // Sort steps by column position (right to left, starting with ones place)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // Process each column from right to left (ones, tens, hundreds)
        for (const step of orderedSteps) {
            // Add sum field for this column
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'sum'
            });

            // Add carry field for the NEXT column if this column generates a carry
            if (step.carry > 0) {
                const nextColumnPosition = step.columnPosition + 1;

                // If this is the rightmost column with a carry and we need an extra box
                if (step.columnPosition === orderedSteps[orderedSteps.length - 1].columnPosition && hasExtraBox) {
                    fields.push({
                        columnPosition: nextColumnPosition,
                        fieldType: 'carry'
                    });
                }
                // For other columns, add carry to the next column
                else {
                    fields.push({
                        columnPosition: nextColumnPosition,
                        fieldType: 'carry'
                    });
                }
            }
        }

        // Add extra sum box if needed (leftmost position)
        if (hasExtraBox) {
            fields.push({
                columnPosition: problem.steps.length,
                fieldType: 'sum'
            });
        }

        return fields;
    }, [problem, hasExtraBox]);

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

    // Check if all fields are filled using shared validation
    const areAllFieldsFilled = useCallback(() => {
        if (!problem) return false;

        // Convert to validation format
        const validationFields = allFields.map(field => ({
            columnPosition: field.columnPosition,
            fieldType: field.fieldType
        }));

        const validationAnswers = userAnswers.map(answer => ({
            columnPosition: answer.columnPosition,
            fieldType: answer.fieldType,
            value: answer.value
        }));

        return checkAllFieldsFilled(validationFields, validationAnswers);
    }, [problem, allFields, userAnswers, checkAllFieldsFilled]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent, onProblemSubmit?: () => void) => {
        if (e.key === KEYBOARD_KEYS.ARROW_RIGHT || e.key === KEYBOARD_KEYS.TAB && !e.shiftKey) {
            e.preventDefault();
            moveToNextField();
        } else if (e.key === KEYBOARD_KEYS.ARROW_LEFT || (e.key === KEYBOARD_KEYS.TAB && e.shiftKey)) {
            e.preventDefault();
            moveToPreviousField();
        } else if (e.key === KEYBOARD_KEYS.ENTER) {
            e.preventDefault();
            if (isSubmitted) {
                // If problem is already submitted, don't auto-advance
                // Let the user manually click "Next Problem" in the ProblemComplete dialog
                return;
            } else if (onProblemSubmit && areAllFieldsFilled()) {
                // Only submit the problem if ALL fields are filled
                onProblemSubmit();
            }
            // If not all fields are filled, do nothing (don't advance to next field)
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