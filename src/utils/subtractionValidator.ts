import type { SubtractionProblem, SubtractionUserAnswer } from '../types/subtraction';

/**
 * Validates a user's answer for a subtraction problem
 */
export function validateSubtractionAnswer(problem: SubtractionProblem, answer: SubtractionUserAnswer): boolean {
    const { columnPosition, fieldType, value } = answer;

    // Find the step for this column position
    const step = problem.steps.find(s => s.columnPosition === columnPosition);

    if (!step) {
        // If this is a borrow field for a column that exists
        if (fieldType === 'borrow') {
            // Find the next step (the one that would receive this borrow)
            const nextStep = problem.steps.find(s => s.columnPosition === columnPosition - 1);
            if (nextStep) {
                return value === nextStep.borrowed;
            }
        }
        return false;
    }

    // Validate based on field type
    if (fieldType === 'difference') {
        return value === step.difference;
    } else if (fieldType === 'borrow') {
        // For borrow, we check if this column was borrowed from
        return value === step.borrowed;
    } else if (fieldType === 'adjusted') {
        // For adjusted minuend, we check the adjusted minuend digit
        return value === step.adjustedMinuend;
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
export function getRequiredSubtractionFields(problem: SubtractionProblem): { columnPosition: number; fieldType: 'difference' | 'borrow' | 'adjusted' }[] {
    const fields: { columnPosition: number; fieldType: 'difference' | 'borrow' | 'adjusted' }[] = [];

    // Sort steps by column position (right to left, starting with ones place)
    const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

    // Process each column from right to left (ones, tens, hundreds)
    for (const step of orderedSteps) {
        // Add difference field for this column
        fields.push({
            columnPosition: step.columnPosition,
            fieldType: 'difference'
        });

        // Add borrow field if borrowing occurred in this column
        if (step.borrowed > 0) {
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'borrow'
            });
        }

        // Add adjusted minuend field if the minuend digit was modified due to borrowing
        if (step.adjustedMinuend !== step.minuendDigit) {
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'adjusted'
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