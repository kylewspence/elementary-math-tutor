import { useState, useCallback, useEffect } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../types/multiplication';
import { KEYBOARD_KEYS } from '../utils/constants';

/**
 * Custom hook to manage keyboard navigation for multiplication problems
 * Follows the natural flow of solving multiplication problems
 */
export function useMultiplicationKeyboardNav(
    problem: MultiplicationProblem | null,
    userAnswers: MultiplicationUserAnswer[],
    onSubmitAnswer: (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void,
    onSubmitProblem: () => void,
    onClearAnswer?: (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void
) {
    // Current focus state - start with rightmost product digit (position 0)
    const [currentFocus, setCurrentFocus] = useState<MultiplicationCurrentFocus>({
        fieldType: 'product',
        fieldPosition: 0,
        partialIndex: undefined
    });

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!problem) return;

        // Handle number keys (0-9)
        if (/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            const value = parseInt(e.key, 10);

            // Submit the answer
            onSubmitAnswer(
                value,
                currentFocus.fieldType,
                currentFocus.fieldPosition,
                currentFocus.partialIndex
            );

            // Auto-advance to the next field
            moveToNextField();
            return;
        }

        // Handle navigation keys
        switch (e.key) {
            case KEYBOARD_KEYS.TAB:
                e.preventDefault();
                if (e.shiftKey) {
                    moveToPreviousField();
                } else {
                    moveToNextField(true); // Allow wrap-around for manual Tab navigation
                }
                break;

            case KEYBOARD_KEYS.ENTER:
                e.preventDefault();
                if (userAnswers.length > 0) {
                    onSubmitProblem();
                }
                break;

            case KEYBOARD_KEYS.BACKSPACE:
            case KEYBOARD_KEYS.DELETE:
                e.preventDefault();
                handleBackspace();
                break;

            case KEYBOARD_KEYS.ARROW_RIGHT:
                e.preventDefault();
                moveToPreviousField(); // Right moves to previous (right-to-left input)
                break;

            case KEYBOARD_KEYS.ARROW_LEFT:
                e.preventDefault();
                moveToNextField(true); // Left moves to next (right-to-left input), allow wrap-around
                break;

            case KEYBOARD_KEYS.ARROW_UP:
                e.preventDefault();
                moveUp();
                break;

            case KEYBOARD_KEYS.ARROW_DOWN:
                e.preventDefault();
                moveDown();
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problem, currentFocus, userAnswers.length, onSubmitAnswer, onSubmitProblem]);

    // Helper function to determine if a position needs a carry
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

    // Get all fields in order for navigation (similar to division tab)
    const getAllFieldsInOrder = useCallback((): MultiplicationCurrentFocus[] => {
        if (!problem) return [];

        const allFields: MultiplicationCurrentFocus[] = [];
        const productDigits = problem.product.toString().length;

        // Build fields in the natural solving order: right to left, interleaving product and carry fields
        for (let pos = 0; pos < productDigits; pos++) {
            // Add the product field at this position
            allFields.push({
                fieldType: 'product',
                fieldPosition: pos,
                partialIndex: undefined
            });

            // If this position needs a carry (and it's not the rightmost position), add it next
            if (pos < productDigits - 1 && shouldShowCarry(pos + 1)) {
                allFields.push({
                    fieldType: 'carry',
                    fieldPosition: pos + 1,
                    partialIndex: 0
                });
            }
        }

        return allFields;
    }, [problem, shouldShowCarry]);

    // Get the previous field for backspace navigation
    const getPreviousField = useCallback((
        fieldType: 'product' | 'partial' | 'carry',
        fieldPosition: number,
        partialIndex?: number
    ): MultiplicationCurrentFocus | null => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = allFields.findIndex(field =>
            field.fieldType === fieldType &&
            field.fieldPosition === fieldPosition &&
            field.partialIndex === partialIndex
        );

        if (currentIndex > 0) {
            return allFields[currentIndex - 1];
        }

        return null; // No previous field if we're at the first field
    }, [getAllFieldsInOrder]);

    // Handle backspace navigation
    const handleBackspace = useCallback(() => {
        const { fieldType, fieldPosition, partialIndex } = currentFocus;

        // Check if current field has a value
        const hasValue = userAnswers.some(answer =>
            answer.fieldType === fieldType &&
            answer.fieldPosition === fieldPosition &&
            answer.partialIndex === partialIndex
        );

        if (hasValue && onClearAnswer) {
            // Clear the current field first
            onClearAnswer(fieldType, fieldPosition, partialIndex);
        } else {
            // Field is empty, move to previous field
            const previousField = getPreviousField(fieldType, fieldPosition, partialIndex);
            if (previousField) {
                setCurrentFocus(previousField);
            }
        }
    }, [currentFocus, userAnswers, onClearAnswer, getPreviousField]);

    // Move to the next field in the tab order (with wrap-around for manual navigation)
    const moveToNextField = useCallback((allowWrapAround: boolean = false) => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = allFields.findIndex(field =>
            field.fieldType === currentFocus.fieldType &&
            field.fieldPosition === currentFocus.fieldPosition &&
            field.partialIndex === currentFocus.partialIndex
        );

        // Move to next field in the ordered list
        if (currentIndex < allFields.length - 1 && currentIndex !== -1) {
            setCurrentFocus(allFields[currentIndex + 1]);
        } else if (allowWrapAround && allFields.length > 0) {
            // Wrap around to the first field only if explicitly allowed (for Tab navigation)
            setCurrentFocus(allFields[0]);
        }
        // If we're at the last field and wrap-around is not allowed, stay there
    }, [currentFocus, getAllFieldsInOrder]);

    // Move to the previous field in the tab order
    const moveToPreviousField = useCallback(() => {
        const allFields = getAllFieldsInOrder();
        const currentIndex = allFields.findIndex(field =>
            field.fieldType === currentFocus.fieldType &&
            field.fieldPosition === currentFocus.fieldPosition &&
            field.partialIndex === currentFocus.partialIndex
        );

        // Move to previous field in the ordered list
        if (currentIndex > 0) {
            setCurrentFocus(allFields[currentIndex - 1]);
        } else if (allFields.length > 0) {
            // Wrap around to the last field if we're at the beginning
            setCurrentFocus(allFields[allFields.length - 1]);
        }
    }, [currentFocus, getAllFieldsInOrder]);

    // Move up (to carry box)
    const moveUp = useCallback(() => {
        if (!problem) return;

        const { fieldType, fieldPosition } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        if (fieldType === 'product' && shouldShowCarry(fieldPosition)) {
            // Move to carry above product - only if this position has a carry
            newFocus = {
                fieldType: 'carry',
                fieldPosition,
                partialIndex: 0
            };
            setCurrentFocus(newFocus);
        }
        // If already at a carry or no carry needed, do nothing
    }, [problem, currentFocus, shouldShowCarry]);

    // Move down (from carry to product)
    const moveDown = useCallback(() => {
        if (!problem) return;

        const { fieldType, fieldPosition } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        if (fieldType === 'carry') {
            // Move from carry to product below
            newFocus = {
                fieldType: 'product',
                fieldPosition,
                partialIndex: undefined
            };
            setCurrentFocus(newFocus);
        }
        // If already at product, do nothing
    }, [problem, currentFocus]);

    // Add event listener for keyboard navigation
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return {
        currentFocus,
        setCurrentFocus,
        handleKeyDown,
        getAllFieldsInOrder,
        getPreviousField
    };
} 