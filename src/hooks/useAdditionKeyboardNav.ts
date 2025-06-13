import { useState, useCallback } from 'react';
import type { AdditionProblem, AdditionUserAnswer } from '../types/addition';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface AdditionCurrentFocus {
    columnPosition: number;
    fieldType: 'sum' | 'carry';
}

export function useAdditionKeyboardNav(problem: AdditionProblem | null, userAnswers: AdditionUserAnswer[] = [], isSubmitted: boolean = false) {
    const [currentFocus, setCurrentFocus] = useState<AdditionCurrentFocus>({
        columnPosition: 0,
        fieldType: 'sum',
    });

    // Check if we need an extra box for the final carry
    // This happens when the sum has more digits than either addend
    const needsExtraBox = useCallback(() => {
        if (!problem) return false;

        // If sum has more digits than the max number of digits in addends
        const maxAddendDigits = Math.max(
            problem.addend1.toString().length,
            problem.addend2.toString().length
        );

        return problem.sum > Math.pow(10, maxAddendDigits) - 1;
    }, [problem]);

    // Get all fields in order for navigation - from right to left (ones, tens, hundreds, etc.)
    const getAllFieldsInOrder = useCallback((): AdditionCurrentFocus[] => {
        if (!problem) return [];

        const allFields: AdditionCurrentFocus[] = [];
        const hasExtraBox = needsExtraBox();

        // Sort steps by column position (right to left, starting with ones place)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // First add all carry fields (from right to left)
        for (const step of orderedSteps) {
            if (step.carry > 0) {
                allFields.push({ columnPosition: step.columnPosition, fieldType: 'carry' });
            }
        }

        // Add extra carry box if needed
        if (hasExtraBox) {
            allFields.push({ columnPosition: orderedSteps.length, fieldType: 'carry' });
        }

        // Then add all sum fields (from right to left)
        for (const step of orderedSteps) {
            allFields.push({ columnPosition: step.columnPosition, fieldType: 'sum' });
        }

        // Add extra sum box if needed (leftmost position)
        if (hasExtraBox) {
            allFields.push({ columnPosition: orderedSteps.length, fieldType: 'sum' });
        }

        return allFields;
    }, [problem, needsExtraBox]);

    // Helper to find index of current field in the ordered list
    const getCurrentFieldIndex = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        return allFields.findIndex(field =>
            field.columnPosition === currentFocus.columnPosition &&
            field.fieldType === currentFocus.fieldType
        );
    }, [currentFocus, getAllFieldsInOrder]);

    // Check if all fields have answers
    const areAllFieldsFilled = useCallback(() => {
        if (!problem) return false;

        const allFields = getAllFieldsInOrder();

        // Check if we have an answer for each field
        return allFields.every(field => {
            return userAnswers.some(answer =>
                answer.columnPosition === field.columnPosition &&
                answer.fieldType === field.fieldType
            );
        });
    }, [problem, userAnswers, getAllFieldsInOrder]);

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
    }, [getAllFieldsInOrder, getCurrentFieldIndex]);

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
    }, [getAllFieldsInOrder, getCurrentFieldIndex]);

    // Jump to specific field
    const jumpToField = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
        if (!problem) return;

        // Verify that the field exists in our problem
        const allFields = getAllFieldsInOrder();
        const fieldExists = allFields.some(
            field => field.columnPosition === columnPosition && field.fieldType === fieldType
        );

        if (fieldExists) {
            setCurrentFocus({
                columnPosition,
                fieldType,
            });
        } else if (allFields.length > 0) {
            // Default to the first field if the requested field doesn't exist
            setCurrentFocus(allFields[0]);
        }
    }, [problem, getAllFieldsInOrder]);

    // Check if we're at the last field
    const isLastField = useCallback(() => {
        if (!problem) return false;

        const allFields = getAllFieldsInOrder();
        const currentIndex = getCurrentFieldIndex();

        return currentIndex === allFields.length - 1;
    }, [problem, getAllFieldsInOrder, getCurrentFieldIndex]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent, onProblemSubmit?: () => void, onNextProblem?: () => void) => {
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
                if (isSubmitted && onNextProblem) {
                    // If problem is already submitted, go to next problem
                    onNextProblem();
                } else if (onProblemSubmit && (isLastField() || areAllFieldsFilled())) {
                    // Submit the problem if we're at the last field or all fields are filled
                    onProblemSubmit();
                } else {
                    // Otherwise just move to next field
                    moveNext();
                }
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
    }, [moveNext, movePrevious, isLastField, areAllFieldsFilled, isSubmitted]);

    // Check if a field is currently focused
    const isFieldFocused = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
        return currentFocus.columnPosition === columnPosition &&
            currentFocus.fieldType === fieldType;
    }, [currentFocus]);

    return {
        currentFocus,
        moveNext,
        movePrevious,
        jumpToField,
        handleKeyDown,
        isFieldFocused,
        needsExtraBox,
    };
} 