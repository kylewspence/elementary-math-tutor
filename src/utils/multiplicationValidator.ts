import type { MultiplicationProblem, MultiplicationUserAnswer } from '../types/multiplication';

/**
 * NOTE: Current implementation is optimized for single-digit multipliers.
 * Multi-digit multiplier validation is incomplete and will be implemented in a future update.
 * DIFFICULTY_CONFIG is temporarily set to only generate single-digit multipliers.
 */

/**
 * Validates a user's answer for a specific field in a multiplication problem
 * @param problem The multiplication problem
 * @param answer The user's answer to validate
 * @returns True if the answer is correct, false otherwise
 */
export function validateMultiplicationAnswer(
    problem: MultiplicationProblem,
    answer: MultiplicationUserAnswer
): boolean {
    // Handle product field (final answer)
    if (answer.fieldType === 'product') {
        // Get the expected digit at this position
        const productStr = problem.product.toString();
        const position = answer.fieldPosition;

        // Check if position is valid
        if (position >= productStr.length) return false;

        // Get the expected digit (from right to left)
        const expectedDigit = parseInt(productStr[productStr.length - 1 - position], 10);

        // Compare with user's answer
        return answer.value === expectedDigit;
    }

    // Handle partial product fields
    else if (answer.fieldType === 'partial') {
        // Make sure we have a valid partial index
        if (answer.partialIndex === undefined ||
            answer.partialIndex < 0 ||
            answer.partialIndex >= problem.partialProducts.length) {
            return false;
        }

        // Get the partial product
        const partial = problem.partialProducts[answer.partialIndex];

        // Get the expected digit at this position
        const partialStr = partial.value.toString();
        const position = answer.fieldPosition;

        // Check if position is valid
        if (position >= partialStr.length) return false;

        // Get the expected digit (from right to left)
        const expectedDigit = parseInt(partialStr[partialStr.length - 1 - position], 10);

        // Compare with user's answer
        return answer.value === expectedDigit;
    }

    // Handle carry fields
    else if (answer.fieldType === 'carry') {
        // For single-digit multiplier
        if (problem.multiplier < 10) {
            const multiplicandStr = problem.multiplicand.toString();
            const position = answer.fieldPosition;

            // Check if position is valid
            if (position > multiplicandStr.length) return false;

            // Special case for leftmost position (beyond the multiplicand)
            if (position === multiplicandStr.length) {
                // The leftmost carry is from the product of the leftmost digit
                const leftmostDigit = parseInt(multiplicandStr[0], 10);
                const product = leftmostDigit * problem.multiplier;
                const expectedCarry = Math.floor(product / 10);
                return answer.value === expectedCarry;
            }

            // For other positions, the carry comes from the digit to the RIGHT
            // (since we're working right-to-left)
            const rightPosition = position - 1;

            // If this is position 0 (rightmost), there's no carry
            if (rightPosition < 0) return false;

            // Get the digit to the right
            const rightDigit = parseInt(multiplicandStr[multiplicandStr.length - 1 - rightPosition], 10);

            // Calculate the product and expected carry
            const product = rightDigit * problem.multiplier;
            const expectedCarry = Math.floor(product / 10); // The carry is the tens digit

            // Compare with user's answer
            return answer.value === expectedCarry;
        }

        // For multi-digit multipliers (more complex)
        // This is a simplified implementation
        return true;
    }

    // Unknown field type
    return false;
}

/**
 * Checks if a multiplication problem is complete (all fields filled correctly)
 * @param problem The multiplication problem
 * @param answers The user's answers
 * @returns True if the problem is complete, false otherwise
 */
export function isMultiplicationProblemComplete(
    problem: MultiplicationProblem,
    answers: MultiplicationUserAnswer[]
): boolean {
    // Check if we have all the product digits
    const productDigits = problem.product.toString().length;
    const productAnswers = answers.filter(a => a.fieldType === 'product');

    // Make sure we have the right number of product answers
    if (productAnswers.length < productDigits) return false;

    // Make sure all product answers are correct
    for (let i = 0; i < productDigits; i++) {
        const answer = answers.find(a => a.fieldType === 'product' && a.fieldPosition === i);
        if (!answer || !answer.isCorrect) return false;
    }

    // For single-digit multiplier, check carry values
    if (problem.multiplier < 10) {
        const multiplicandStr = problem.multiplicand.toString();

        // Check for leftmost carry if needed
        const leftmostDigit = parseInt(multiplicandStr[0], 10);
        const leftmostProduct = leftmostDigit * problem.multiplier;
        if (leftmostProduct >= 10) {
            // Check if we have a carry for the leftmost position
            const leftmostCarryAnswer = answers.find(
                a => a.fieldType === 'carry' &&
                    a.fieldPosition === multiplicandStr.length
            );

            if (!leftmostCarryAnswer || !leftmostCarryAnswer.isCorrect) {
                return false;
            }
        }

        // Check carries for other positions
        for (let i = 0; i < multiplicandStr.length - 1; i++) {
            // The digit at position i generates a carry for position i+1
            const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - i], 10);
            const product = digit * problem.multiplier;

            // If this position generates a carry
            if (product >= 10) {
                // Look for a carry answer at the next position
                const carryAnswer = answers.find(
                    a => a.fieldType === 'carry' &&
                        a.fieldPosition === i + 1
                );

                if (!carryAnswer || !carryAnswer.isCorrect) {
                    return false;
                }
            }
        }
    }

    // If we got here, all required fields are filled correctly
    return true;
} 