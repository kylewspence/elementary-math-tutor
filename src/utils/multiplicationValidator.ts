import type { MultiplicationProblem, MultiplicationUserAnswer } from '../types/multiplication';

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
            if (position >= multiplicandStr.length) return false;

            // Get the digit at this position
            const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - position], 10);

            // Calculate the product and expected carry
            const product = digit * problem.multiplier;
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

    // Check if we need to validate carry answers
    const multiplicandStr = problem.multiplicand.toString();
    for (let i = 0; i < multiplicandStr.length; i++) {
        const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - i], 10);
        const product = digit * problem.multiplier;

        // If this position needs a carry
        if (product >= 10) {
            const answer = answers.find(
                a => a.fieldType === 'carry' &&
                    a.fieldPosition === i &&
                    a.partialIndex === 0
            );

            if (!answer || !answer.isCorrect) return false;
        }
    }

    // Check if we have all the partial product digits
    for (let i = 0; i < problem.partialProducts.length; i++) {
        const partial = problem.partialProducts[i];
        const partialDigits = partial.value.toString().length;

        // Check each digit position
        for (let j = 0; j < partialDigits; j++) {
            const answer = answers.find(
                a => a.fieldType === 'partial' &&
                    a.fieldPosition === j &&
                    a.partialIndex === i
            );

            if (!answer || !answer.isCorrect) return false;
        }
    }

    // If we got here, all fields are filled correctly
    return true;
} 