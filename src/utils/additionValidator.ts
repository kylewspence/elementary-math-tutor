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

    if (!step) {
        // If this is a carry field for a column that exists
        if (fieldType === 'carry') {
            // Find the previous step (the one that would generate this carry)
            const prevStep = problem.steps.find(s => s.columnPosition === columnPosition - 1);
            if (prevStep) {
                return value === prevStep.carry;
            }
        }
        return false;
    }

    // Validate based on field type
    if (fieldType === 'sum') {
        return value === step.sum;
    } else if (fieldType === 'carry') {
        // For carry, we need to find the previous column (the one that generated this carry)
        const prevStep = problem.steps.find(s => s.columnPosition === columnPosition - 1);
        if (prevStep) {
            return value === prevStep.carry;
        }
        return false;
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
    const allFieldsCorrect = requiredFields.every(field =>
        answers.some(answer =>
            answer.columnPosition === field.columnPosition &&
            answer.fieldType === field.fieldType &&
            answer.isCorrect
        )
    );

    // Debug log
    console.log('Required fields:', requiredFields);
    console.log('User answers:', answers);
    console.log('All fields correct:', allFieldsCorrect);

    return allFieldsCorrect;
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

    // Sort steps by column position (right to left, starting with ones place)
    const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

    // Process each column from right to left (ones, tens, hundreds)
    for (const step of orderedSteps) {
        // Add sum field for this column
        fields.push({
            columnPosition: step.columnPosition,
            fieldType: 'sum'
        });

        // Add carry field for the NEXT column if this column generates a carry
        if (step.carry > 0) {
            const nextColumnPosition = step.columnPosition + 1;

            // If this is the rightmost column with a carry and we need an extra box
            if (step.columnPosition === orderedSteps[orderedSteps.length - 1].columnPosition && needsExtraBox) {
                fields.push({
                    columnPosition: nextColumnPosition,
                    fieldType: 'carry'
                });
            }
            // For other columns, add carry to the next column
            else {
                fields.push({
                    columnPosition: nextColumnPosition,
                    fieldType: 'carry'
                });
            }
        }
    }

    // Add extra sum box if needed (leftmost position)
    if (needsExtraBox) {
        fields.push({
            columnPosition: problem.steps.length,
            fieldType: 'sum'
        });
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