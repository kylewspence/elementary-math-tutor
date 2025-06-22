import type { SubtractionProblem, SubtractionUserAnswer } from '../types/subtraction';

/**
 * Validates a user's answer for a subtraction problem
 */
export function validateSubtractionAnswer(problem: SubtractionProblem, answer: SubtractionUserAnswer): boolean {
    const { columnPosition, fieldType, value } = answer;

    // Find the step for this column position
    const step = problem.steps.find(s => s.columnPosition === columnPosition);

    if (!step) {
        // If no step found for this column, it's invalid
        return false;
    }

    // Validate based on field type
    if (fieldType === 'difference') {
        return value === step.difference;
    } else if (fieldType === 'borrow') {
        // For borrow, accept multiple valid approaches:
        // 1. Traditional: exact borrowReceived amount (usually 1)
        // 2. Alternative: the reduced digit value (original digit minus borrow amount)
        // 3. Zero if no borrowing needed

        if (step.borrowReceived === 0) {
            // No borrowing needed, only accept 0 or empty
            return value === 0;
        } else {
            // Borrowing needed - accept either:
            // - The exact borrow amount (traditional method)
            // - The reduced original digit value (alternative method)
            const exactBorrowAmount = step.borrowReceived;
            const reducedDigitValue = step.digit1 - step.borrowReceived;

            return value === exactBorrowAmount || value === reducedDigitValue;
        }
    }

    return false;
}

/**
 * Checks if all required fields for a subtraction problem have been answered correctly
 */
export function isSubtractionProblemComplete(problem: SubtractionProblem, answers: SubtractionUserAnswer[]): boolean {
    if (!problem || !answers.length) return false;

    // Get all required fields
    const requiredFields = getRequiredSubtractionFields(problem);

    // Check if we have correct answers for all required fields
    const allFieldsCorrect = requiredFields.every(field =>
        answers.some(answer =>
            answer.columnPosition === field.columnPosition &&
            answer.fieldType === field.fieldType &&
            answer.isCorrect
        )
    );

    return allFieldsCorrect;
}

/**
 * Gets all required field positions for a subtraction problem
 */
export function getRequiredSubtractionFields(problem: SubtractionProblem): { columnPosition: number; fieldType: 'difference' | 'borrow' }[] {
    const fields: { columnPosition: number; fieldType: 'difference' | 'borrow' }[] = [];

    // Sort steps by column position (right to left, starting with ones place)
    const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

    // Process each column from right to left (ones, tens, hundreds)
    for (const step of orderedSteps) {
        // Add difference field for this column
        fields.push({
            columnPosition: step.columnPosition,
            fieldType: 'difference'
        });

        // Add borrow field for this column if it receives a borrow
        if (step.borrowReceived > 0) {
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'borrow'
            });
        }
    }

    return fields;
}

/**
 * Checks if all fields have been filled (not necessarily correctly)
 */
export function areAllSubtractionFieldsFilled(problem: SubtractionProblem, answers: SubtractionUserAnswer[]): boolean {
    const requiredFields = getRequiredSubtractionFields(problem);

    // Check if we have an answer for each required field
    return requiredFields.every(field =>
        answers.some(answer =>
            answer.columnPosition === field.columnPosition &&
            answer.fieldType === field.fieldType
        )
    );
} 