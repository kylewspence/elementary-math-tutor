import { useCallback } from 'react';
import { useMathKeyboardNav } from './useMathKeyboardNav';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../types/multiplication';


/**
 * Custom hook to manage keyboard navigation for multiplication problems
 * Follows the natural flow of solving multiplication problems
 */
export function useMultiplicationKeyboardNav(
    problem: MultiplicationProblem | null,
    userAnswers: MultiplicationUserAnswer[],
    isSubmitted: boolean = false,
    onProblemSubmit?: () => void
) {
    // Get all fields in navigation order (following addition pattern)
    const getAllFields = useCallback(() => {
        if (!problem) return [];
        const fields: MultiplicationCurrentFocus[] = [];

        // Helper function to check if a carry is needed at a position
        // This MUST match the shouldShowCarry logic in MultiplicationDisplay exactly
        const needsCarry = (position: number): boolean => {
            if (problem.multiplier >= 10) return false; // Multi-digit multipliers not supported yet

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
        };

        // Navigate through positions like addition: product → carry → product → carry
        const productDigits = problem.product.toString().length;
        for (let i = 0; i < productDigits; i++) {
            // Add product field for this position
            fields.push({ fieldType: 'product', fieldPosition: i, partialIndex: undefined });

            // Add carry field for next position if needed (like addition does)
            const nextPosition = i + 1;
            if (needsCarry(nextPosition)) {
                fields.push({ fieldType: 'carry', fieldPosition: nextPosition, partialIndex: 0 });
            }
        }

        return fields;
    }, [problem]);

    // Use the shared hook
    const nav = useMathKeyboardNav<MultiplicationCurrentFocus>(getAllFields, {
        isSubmitted,
        onProblemSubmit,
        fieldEquals: (a, b) =>
            a.fieldType === b.fieldType &&
            a.fieldPosition === b.fieldPosition &&
            a.partialIndex === b.partialIndex,
    });

    return nav;
} 