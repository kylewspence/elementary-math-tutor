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
    onSubmitProblem: () => void
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

            // Automatically move to next field (similar to Tab behavior)
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
                    moveToNextField();
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
                // Clear the current field by submitting a special value (e.g., -1)
                // This would need to be handled in the game state
                break;

            case KEYBOARD_KEYS.ARROW_RIGHT:
                e.preventDefault();
                moveToPreviousField(); // Right moves to previous (right-to-left input)
                break;

            case KEYBOARD_KEYS.ARROW_LEFT:
                e.preventDefault();
                moveToNextField(); // Left moves to next (right-to-left input)
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
    }, [problem, currentFocus, userAnswers.length]);

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

    // Move to the next field in the tab order
    const moveToNextField = useCallback(() => {
        if (!problem) return;

        const productDigits = problem.product.toString().length;
        const multiplicandDigits = problem.multiplicand.toString().length;

        // Current position
        const { fieldType, fieldPosition } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        // Navigation logic - following the natural flow of solving multiplication problems
        if (fieldType === 'product') {
            // If we're in the product row
            if (fieldPosition < productDigits - 1) {
                // Move to the next product digit (left)
                const nextPosition = fieldPosition + 1;

                // Check if there's a carry needed for the next position
                if (shouldShowCarry(nextPosition)) {
                    // Move to the carry box above the next position
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: nextPosition,
                        partialIndex: 0 // Use 0 for all carries
                    };
                } else {
                    // Move to the next product digit (left)
                    newFocus = {
                        fieldType: 'product',
                        fieldPosition: nextPosition,
                        partialIndex: undefined
                    };
                }
            } else {
                // We're at the leftmost product digit
                // Check if we need a leftmost carry box
                if (shouldShowCarry(multiplicandDigits)) {
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: multiplicandDigits,
                        partialIndex: 0
                    };
                } else {
                    // Wrap around to the first product digit
                    newFocus = {
                        fieldType: 'product',
                        fieldPosition: 0,
                        partialIndex: undefined
                    };
                }
            }
        } else if (fieldType === 'carry') {
            // After filling in a carry, move to the product digit below it
            newFocus = {
                fieldType: 'product',
                fieldPosition: fieldPosition,
                partialIndex: undefined
            };
        }

        // Update the focus
        setCurrentFocus(newFocus!);
    }, [problem, currentFocus, shouldShowCarry]);

    // Move to the previous field in the tab order
    const moveToPreviousField = useCallback(() => {
        if (!problem) return;

        const productDigits = problem.product.toString().length;
        const multiplicandDigits = problem.multiplicand.toString().length;

        // Current position
        const { fieldType, fieldPosition } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        // Reverse navigation logic
        if (fieldType === 'product') {
            if (fieldPosition > 0) {
                // Check if the current position has a carry
                if (shouldShowCarry(fieldPosition)) {
                    // Move to the carry box above this position
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: fieldPosition,
                        partialIndex: 0
                    };
                } else {
                    // Move to the previous product digit
                    const prevPosition = fieldPosition - 1;
                    newFocus = {
                        fieldType: 'product',
                        fieldPosition: prevPosition,
                        partialIndex: undefined
                    };
                }
            } else {
                // We're at the rightmost product digit
                // Check if there's a leftmost carry
                if (shouldShowCarry(multiplicandDigits)) {
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: multiplicandDigits,
                        partialIndex: 0
                    };
                } else {
                    // Find the rightmost carry box
                    let foundCarry = false;
                    for (let pos = multiplicandDigits - 1; pos > 0; pos--) {
                        if (shouldShowCarry(pos)) {
                            newFocus = {
                                fieldType: 'carry',
                                fieldPosition: pos,
                                partialIndex: 0
                            };
                            foundCarry = true;
                            break;
                        }
                    }

                    if (!foundCarry) {
                        // Wrap around to the leftmost product digit
                        newFocus = {
                            fieldType: 'product',
                            fieldPosition: productDigits - 1,
                            partialIndex: undefined
                        };
                    }
                }
            }
        } else if (fieldType === 'carry') {
            // From carry, find the previous position that has a carry
            let prevPosition = fieldPosition - 1;

            // Look for previous positions with carries
            while (prevPosition > 0) {
                if (shouldShowCarry(prevPosition)) {
                    // Found a previous position with a carry
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: prevPosition,
                        partialIndex: 0
                    };
                    break;
                }
                prevPosition--;
            }

            if (prevPosition <= 0) {
                // No previous carry found, go to the rightmost product digit
                newFocus = {
                    fieldType: 'product',
                    fieldPosition: 0,
                    partialIndex: undefined
                };
            }
        }

        // Update the focus
        setCurrentFocus(newFocus!);
    }, [problem, currentFocus, shouldShowCarry]);

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
        handleKeyDown
    };
} 