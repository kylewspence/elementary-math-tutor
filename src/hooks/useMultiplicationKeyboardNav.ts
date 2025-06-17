import { useMathKeyboardNav } from './useMathKeyboardNav';
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
    // Get all fields in navigation order
    const getAllFields = () => {
        if (!problem) return [];
        const fields: MultiplicationCurrentFocus[] = [];
        // Product digits (right to left)
        const productDigits = problem.product.toString().length;
        for (let i = 0; i < productDigits; i++) {
            fields.push({ fieldType: 'product', fieldPosition: i, partialIndex: undefined });
        }
        // Carry boxes (if needed)
        const multiplicandDigits = problem.multiplicand.toString().length;
        for (let i = 1; i <= multiplicandDigits; i++) {
            // Only add carry if needed (logic matches shouldShowCarry)
            // For leftmost carry
            if (i === multiplicandDigits) {
                const leftmostDigit = parseInt(problem.multiplicand.toString()[0], 10);
                const product = leftmostDigit * problem.multiplier;
                if (product >= 10) {
                    fields.push({ fieldType: 'carry', fieldPosition: i, partialIndex: 0 });
                }
            } else {
                // For other carries
                const rightDigit = parseInt(problem.multiplicand.toString()[multiplicandDigits - i], 10);
                const product = rightDigit * problem.multiplier;
                if (product >= 10) {
                    fields.push({ fieldType: 'carry', fieldPosition: i, partialIndex: 0 });
                }
            }
        }
        return fields;
    };

    // Use the shared hook
    const nav = useMathKeyboardNav<MultiplicationCurrentFocus>(getAllFields, {
        fieldEquals: (a, b) =>
            a.fieldType === b.fieldType &&
            a.fieldPosition === b.fieldPosition &&
            a.partialIndex === b.partialIndex,
    });

    return nav;
} 