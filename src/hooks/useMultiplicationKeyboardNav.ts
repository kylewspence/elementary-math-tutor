import { useState, useCallback, useMemo } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../types/multiplication';
import { KEYBOARD_KEYS } from '../utils/constants';
import { useSharedValidation } from './useSharedValidation';

export function useMultiplicationKeyboardNav(
    problem: MultiplicationProblem | null,
    userAnswers: MultiplicationUserAnswer[],
    isSubmitted: boolean = false
) {
    const { areAllFieldsFilled: checkAllFieldsFilled } = useSharedValidation();

    // Initialize with focus on the rightmost product digit (position 0)
    const [currentFocus, setCurrentFocus] = useState<MultiplicationCurrentFocus>({
        fieldType: 'product',
        fieldPosition: 0,
    });

    // Helper function to determine if a position needs a carry (from original implementation)
    const shouldShowCarry = useCallback((position: number): boolean => {
        if (!problem) return false;

        // For single-digit multiplier
        if (problem.multiplier < 10) {
            const multiplicandStr = problem.multiplicand.toString();

            // Position is from right to left, so we need to adjust the index
            if (position >= multiplicandStr.length + 1) return false; // +1 to allow for leftmost carry

            // Special case for leftmost position
            if (position === multiplicandStr.length) {
                // Check if the leftmost digit multiplication generates a carry
                const leftmostDigit = parseInt(multiplicandStr[0], 10);
                const product = leftmostDigit * problem.multiplier;
                // If the product is 10 or greater, we need an extra carry box
                return product >= 10;
            }

            // For the rightmost digit, we don't need a carry box
            if (position === 0) return false;

            // Check if the digit to the right generates a carry
            const rightPosition = position - 1;
            if (rightPosition < 0) return false;

            const rightDigit = parseInt(multiplicandStr[multiplicandStr.length - 1 - rightPosition], 10);
            const product = rightDigit * problem.multiplier;

            // If the product is 10 or greater, it generates a carry
            return product >= 10;
        }

        // For multi-digit multipliers (not implemented yet)
        return false;
    }, [problem]);

    // Get all fields in the order they should be navigated (similar to Addition pattern)
    const allFields = useMemo(() => {
        if (!problem) return [];

        const fields: MultiplicationCurrentFocus[] = [];
        const productStr = (problem.multiplicand * problem.multiplier).toString();

        // Build fields in the natural solving order: right to left, interleaving product and carry fields
        for (let pos = 0; pos < productStr.length; pos++) {
            // Add the product field at this position
            fields.push({
                fieldType: 'product',
                fieldPosition: pos,
                partialIndex: undefined
            });

            // If this position needs a carry (and it's not the rightmost position), add it next
            if (pos < productStr.length - 1 && shouldShowCarry(pos + 1)) {
                fields.push({
                    fieldType: 'carry',
                    fieldPosition: pos + 1,
                    partialIndex: 0
                });
            }
        }

        return fields;
    }, [problem, shouldShowCarry]);

    // Move to the next field in the navigation order (matching Addition pattern)
    const moveToNextField = useCallback(() => {
        if (!problem || allFields.length === 0) return;

        // Find the current field in the ordered list
        const currentIndex = allFields.findIndex(
            field => field.fieldType === currentFocus.fieldType &&
                field.fieldPosition === currentFocus.fieldPosition &&
                field.partialIndex === currentFocus.partialIndex
        );

        // If found and not the last field, move to the next one
        if (currentIndex !== -1 && currentIndex < allFields.length - 1) {
            const nextField = allFields[currentIndex + 1];
            setCurrentFocus({
                fieldType: nextField.fieldType,
                fieldPosition: nextField.fieldPosition,
                partialIndex: nextField.partialIndex
            });
        }
    }, [problem, allFields, currentFocus]);

    // Move to the previous field in the navigation order (matching Addition pattern)
    const moveToPreviousField = useCallback(() => {
        if (!problem || allFields.length === 0) return;

        // Find the current field in the ordered list
        const currentIndex = allFields.findIndex(
            field => field.fieldType === currentFocus.fieldType &&
                field.fieldPosition === currentFocus.fieldPosition &&
                field.partialIndex === currentFocus.partialIndex
        );

        // If found and not the first field, move to the previous one
        if (currentIndex > 0) {
            const prevField = allFields[currentIndex - 1];
            setCurrentFocus({
                fieldType: prevField.fieldType,
                fieldPosition: prevField.fieldPosition,
                partialIndex: prevField.partialIndex
            });
        }
    }, [problem, allFields, currentFocus]);

    // Check if all fields are filled using shared validation
    const areAllFieldsFilled = useCallback(() => {
        if (!problem) return false;

        // Convert to validation format
        const validationFields = allFields.map(field => ({
            fieldType: field.fieldType,
            fieldPosition: field.fieldPosition,
            partialIndex: field.partialIndex
        }));

        const validationAnswers = userAnswers.map(answer => ({
            fieldType: answer.fieldType,
            fieldPosition: answer.fieldPosition,
            partialIndex: answer.partialIndex,
            value: answer.value
        }));

        return checkAllFieldsFilled(validationFields, validationAnswers);
    }, [problem, allFields, userAnswers, checkAllFieldsFilled]);

    // Handle keyboard navigation (matching Division pattern exactly)
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
                // Let the Input component's onEnter handle "Next Problem"
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

    // Jump to a specific field (matching Addition pattern)
    const jumpToField = useCallback((fieldType: 'product' | 'partial' | 'carry', fieldPosition: number, partialIndex?: number) => {
        setCurrentFocus({
            fieldType,
            fieldPosition,
            partialIndex,
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