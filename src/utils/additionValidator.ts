import type { AdditionProblem, AdditionUserAnswer } from '../types/addition';

/**
 * Validates a user's answer for an addition problem
 */
export function validateAdditionAnswer(problem: AdditionProblem, answer: AdditionUserAnswer): boolean {
    const { columnPosition, fieldType, value } = answer;

    // Special case for the extra digit (when sum has more digits than addends)
    if (columnPosition === problem.steps.length) {
        if (fieldType === 'sum') {
            // The extra digit should be 1 (the carry from the last column)
            return value === 1;
        } else if (fieldType === 'carry') {
            // There's no carry for the extra digit
            return value === 0;
        }
        return false;
    }

    // Find the step for this column position
    const step = problem.steps.find(s => s.columnPosition === columnPosition);

    if (!step) return false;

    // Validate based on field type
    if (fieldType === 'sum') {
        return value === step.sum;
    } else if (fieldType === 'carry') {
        return value === step.carry;
    }

    return false;
}

/**
 * Checks if all required fields for an addition problem have been answered correctly
 */
export function isAdditionProblemComplete(problem: AdditionProblem, answers: AdditionUserAnswer[]): boolean {
    if (!problem || !answers.length) return false;

    // Get all required fields
    const requiredFields = getRequiredAdditionFields(problem);

    // Check if we have correct answers for all required fields
    return requiredFields.every(field =>
        answers.some(answer =>
            answer.columnPosition === field.columnPosition &&
            answer.fieldType === field.fieldType &&
            answer.isCorrect
        )
    );
}

/**
 * Gets all required field positions for an addition problem
 */
export function getRequiredAdditionFields(problem: AdditionProblem): { columnPosition: number; fieldType: 'sum' | 'carry' }[] {
    const fields: { columnPosition: number; fieldType: 'sum' | 'carry' }[] = [];

    // Check if we need an extra box for the final carry
    // This happens when the sum has more digits than either addend
    const maxAddendDigits = Math.max(
        problem.addend1.toString().length,
        problem.addend2.toString().length
    );

    const needsExtraBox = problem.sum > Math.pow(10, maxAddendDigits) - 1;

    // Add carry fields for columns that have carries
    for (const step of problem.steps) {
        if (step.carry > 0) {
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'carry'
            });
        }
    }

    // Add sum fields for each column
    for (const step of problem.steps) {
        fields.push({
            columnPosition: step.columnPosition,
            fieldType: 'sum'
        });
    }

    if (needsExtraBox) {
        // Add the extra sum field (leftmost position)
        fields.push({
            columnPosition: problem.steps.length,
            fieldType: 'sum'
        });

        // We don't need a carry for the extra digit
    }

    return fields;
}

/**
 * Checks if all fields have been filled (not necessarily correctly)
 */
export function areAllAdditionFieldsFilled(problem: AdditionProblem, answers: AdditionUserAnswer[]): boolean {
    const requiredFields = getRequiredAdditionFields(problem);

    // Check if we have an answer for each required field
    return requiredFields.every(field =>
        answers.some(answer =>
            answer.columnPosition === field.columnPosition &&
            answer.fieldType === field.fieldType
        )
    );
} 