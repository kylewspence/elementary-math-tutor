import { useState, useCallback, useEffect } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../types/multiplication';
import { KEYBOARD_KEYS } from '../utils/constants';

/**
 * Custom hook to manage keyboard navigation for multiplication problems
 * Matches the division tab's keyboard navigation pattern
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

        // Get product and partial product lengths for navigation
        const productDigits = problem.product.toString().length;
        const hasPartialProducts = problem.multiplier >= 10;

        // We don't need to check productDigits and hasPartialProducts here
        // They'll be used in the navigation functions

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

    // Move to the next field in the tab order
    const moveToNextField = useCallback(() => {
        if (!problem) return;

        const productDigits = problem.product.toString().length;
        const hasPartialProducts = problem.multiplier >= 10;

        // Define the navigation order based on the problem structure
        // For multiplication, we generally work right-to-left and top-to-bottom

        // Current position
        const { fieldType, fieldPosition, partialIndex } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        // Navigation logic - similar to division tab
        if (fieldType === 'product') {
            // If we're in the product row
            if (fieldPosition < productDigits - 1) {
                // Move to the next product digit (left)
                newFocus = {
                    fieldType: 'product',
                    fieldPosition: fieldPosition + 1,
                    partialIndex: undefined
                };
            } else if (hasPartialProducts) {
                // Move to the first partial product's first digit
                newFocus = {
                    fieldType: 'partial',
                    fieldPosition: 0,
                    partialIndex: 0
                };
            } else {
                // No partial products, check if we need to go to carry
                newFocus = {
                    fieldType: 'carry',
                    fieldPosition: 0,
                    partialIndex: problem.partialProducts.length // Use last index for final product carries
                };
            }
        } else if (fieldType === 'partial') {
            // If we're in a partial product row
            const partialIndex = currentFocus.partialIndex ?? 0;
            const currentPartial = problem.partialProducts[partialIndex];
            const partialDigits = currentPartial.value.toString().length;

            if (fieldPosition < partialDigits - 1) {
                // Move to next digit in same partial product
                newFocus = {
                    fieldType: 'partial',
                    fieldPosition: fieldPosition + 1,
                    partialIndex
                };
            } else if (partialIndex < problem.partialProducts.length - 1) {
                // Move to next partial product's first digit
                newFocus = {
                    fieldType: 'partial',
                    fieldPosition: 0,
                    partialIndex: partialIndex + 1
                };
            } else {
                // Move to carry row for final product
                newFocus = {
                    fieldType: 'carry',
                    fieldPosition: 0,
                    partialIndex: problem.partialProducts.length // Use last index for final product carries
                };
            }
        } else if (fieldType === 'carry') {
            // If we're in a carry row
            const carryPartialIndex = currentFocus.partialIndex ?? problem.partialProducts.length;

            if (carryPartialIndex === problem.partialProducts.length) {
                // We're in the final product carry row
                if (fieldPosition < productDigits - 1) {
                    // Move to next carry position
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: fieldPosition + 1,
                        partialIndex: carryPartialIndex
                    };
                } else {
                    // Loop back to first product digit
                    newFocus = {
                        fieldType: 'product',
                        fieldPosition: 0,
                        partialIndex: undefined
                    };
                }
            } else {
                // We're in a partial product carry row
                const partialDigits = problem.partialProducts[carryPartialIndex].value.toString().length;

                if (fieldPosition < partialDigits - 1) {
                    // Move to next carry in same row
                    newFocus = {
                        fieldType: 'carry',
                        fieldPosition: fieldPosition + 1,
                        partialIndex: carryPartialIndex
                    };
                } else {
                    // Move to the partial product below this carry
                    newFocus = {
                        fieldType: 'partial',
                        fieldPosition: 0,
                        partialIndex: carryPartialIndex
                    };
                }
            }
        }

        // Update the focus
        setCurrentFocus(newFocus!);
    }, [problem, currentFocus]);

    // Move to the previous field in the tab order
    const moveToPreviousField = useCallback(() => {
        if (!problem) return;

        const productDigits = problem.product.toString().length;
        const hasPartialProducts = problem.multiplier >= 10;

        // Current position
        const { fieldType, fieldPosition, partialIndex } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        // Reverse navigation logic
        if (fieldType === 'product') {
            if (fieldPosition > 0) {
                // Move to the previous product digit (right)
                newFocus = {
                    fieldType: 'product',
                    fieldPosition: fieldPosition - 1,
                    partialIndex: undefined
                };
            } else if (hasPartialProducts) {
                // Move to the last partial product's last digit
                const lastPartialIndex = problem.partialProducts.length - 1;
                const lastPartialDigits = problem.partialProducts[lastPartialIndex].value.toString().length;

                newFocus = {
                    fieldType: 'partial',
                    fieldPosition: lastPartialDigits - 1,
                    partialIndex: lastPartialIndex
                };
            } else {
                // Loop to the last carry position
                newFocus = {
                    fieldType: 'carry',
                    fieldPosition: productDigits - 1,
                    partialIndex: problem.partialProducts.length
                };
            }
        } else if (fieldType === 'partial') {
            const currentPartialIndex = partialIndex ?? 0;

            if (fieldPosition > 0) {
                // Move to previous digit in same partial product
                newFocus = {
                    fieldType: 'partial',
                    fieldPosition: fieldPosition - 1,
                    partialIndex: currentPartialIndex
                };
            } else if (currentPartialIndex > 0) {
                // Move to previous partial product's last digit
                const prevPartialIndex = currentPartialIndex - 1;
                const prevPartialDigits = problem.partialProducts[prevPartialIndex].value.toString().length;

                newFocus = {
                    fieldType: 'partial',
                    fieldPosition: prevPartialDigits - 1,
                    partialIndex: prevPartialIndex
                };
            } else {
                // Move to last product digit
                newFocus = {
                    fieldType: 'product',
                    fieldPosition: productDigits - 1,
                    partialIndex: undefined
                };
            }
        } else if (fieldType === 'carry') {
            const carryPartialIndex = partialIndex ?? problem.partialProducts.length;

            if (fieldPosition > 0) {
                // Move to previous carry position
                newFocus = {
                    fieldType: 'carry',
                    fieldPosition: fieldPosition - 1,
                    partialIndex: carryPartialIndex
                };
            } else if (carryPartialIndex === problem.partialProducts.length) {
                // We're in the final product carry row, move to last partial product
                if (hasPartialProducts) {
                    const lastPartialIndex = problem.partialProducts.length - 1;
                    const lastPartialDigits = problem.partialProducts[lastPartialIndex].value.toString().length;

                    newFocus = {
                        fieldType: 'partial',
                        fieldPosition: lastPartialDigits - 1,
                        partialIndex: lastPartialIndex
                    };
                } else {
                    // No partial products, go to last product digit
                    newFocus = {
                        fieldType: 'product',
                        fieldPosition: productDigits - 1,
                        partialIndex: undefined
                    };
                }
            } else {
                // We're in a partial product carry row
                if (carryPartialIndex > 0) {
                    // Move to previous partial product's last digit
                    const prevPartialIndex = carryPartialIndex - 1;
                    const prevPartialDigits = problem.partialProducts[prevPartialIndex].value.toString().length;

                    newFocus = {
                        fieldType: 'partial',
                        fieldPosition: prevPartialDigits - 1,
                        partialIndex: prevPartialIndex
                    };
                } else {
                    // First partial product carry, go to last product digit
                    newFocus = {
                        fieldType: 'product',
                        fieldPosition: productDigits - 1,
                        partialIndex: undefined
                    };
                }
            }
        }

        // Update the focus
        setCurrentFocus(newFocus!);
    }, [problem, currentFocus]);

    // Move up (to carry or previous row)
    const moveUp = useCallback(() => {
        if (!problem) return;

        const { fieldType, fieldPosition, partialIndex } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        if (fieldType === 'product') {
            // Move to carry above product
            newFocus = {
                fieldType: 'carry',
                fieldPosition,
                partialIndex: problem.partialProducts.length
            };
        } else if (fieldType === 'partial') {
            // Move to carry above this partial product
            newFocus = {
                fieldType: 'carry',
                fieldPosition,
                partialIndex
            };
        } else if (fieldType === 'carry') {
            // Already at top, do nothing or loop to bottom
            return;
        }

        // Update the focus
        setCurrentFocus(newFocus!);
    }, [problem, currentFocus]);

    // Move down (to product or next row)
    const moveDown = useCallback(() => {
        if (!problem) return;

        const { fieldType, fieldPosition, partialIndex } = currentFocus;

        // New focus to be calculated
        let newFocus: MultiplicationCurrentFocus;

        if (fieldType === 'carry') {
            const carryPartialIndex = partialIndex ?? problem.partialProducts.length;

            if (carryPartialIndex === problem.partialProducts.length) {
                // Move from final carry to product
                newFocus = {
                    fieldType: 'product',
                    fieldPosition,
                    partialIndex: undefined
                };
            } else {
                // Move from partial carry to partial product
                newFocus = {
                    fieldType: 'partial',
                    fieldPosition,
                    partialIndex: carryPartialIndex
                };
            }
        } else {
            // Already at bottom, do nothing or loop to top
            return;
        }

        // Update the focus
        setCurrentFocus(newFocus!);
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