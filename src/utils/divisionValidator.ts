import type { DivisionProblem, UserAnswer } from '../types/game';

// Helper to get digit at specific position (0 = rightmost)
function getDigitAtPosition(value: number, position: number): number {
    const str = value.toString();
    const index = str.length - 1 - position;
    return index >= 0 ? parseInt(str[index]) : 0;
}

// Helper to find answers that match specific criteria - refactored to avoid repetition
function findMatchingAnswer(
    userAnswers: UserAnswer[],
    stepNumber: number,
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown',
    fieldPosition: number,
    requireCorrect: boolean = true
): UserAnswer | undefined {
    return userAnswers.find(
        a => a.stepNumber === stepNumber &&
            a.fieldType === fieldType &&
            a.fieldPosition === fieldPosition &&
            (requireCorrect ? a.isCorrect : true)
    );
}

export function validateAnswer(
    problem: DivisionProblem,
    userAnswer: UserAnswer
): boolean {
    const { stepNumber, fieldType, fieldPosition, value } = userAnswer;

    if (!problem.steps[stepNumber]) {
        return false;
    }

    const step = problem.steps[stepNumber];

    switch (fieldType) {
        case 'quotient':
            return value === step.quotientDigit;
        case 'multiply':
            return value === getDigitAtPosition(step.multiply, fieldPosition);
        case 'subtract':
            return value === getDigitAtPosition(step.subtract, fieldPosition);
        case 'bringDown':
            return value === (step.bringDown || 0);
        default:
            return false;
    }
}

export function getCorrectAnswer(
    problem: DivisionProblem,
    stepNumber: number,
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown',
    fieldPosition: number = 0
): number | null {
    if (!problem.steps[stepNumber]) {
        return null;
    }

    const step = problem.steps[stepNumber];

    switch (fieldType) {
        case 'quotient':
            return step.quotientDigit;
        case 'multiply':
            return getDigitAtPosition(step.multiply, fieldPosition);
        case 'subtract':
            return getDigitAtPosition(step.subtract, fieldPosition);
        case 'bringDown':
            return step.bringDown || null;
        default:
            return null;
    }
}

export function isProblemComplete(
    problem: DivisionProblem,
    userAnswers: UserAnswer[]
): boolean {
    // Check if all required fields have been answered correctly
    for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        const step = problem.steps[stepIndex];

        // Check quotient
        const quotientAnswer = findMatchingAnswer(userAnswers, stepIndex, 'quotient', 0);
        if (!quotientAnswer) return false;

        // Check multiply digits
        const multiplyDigits = step.multiply.toString().length;
        for (let pos = 0; pos < multiplyDigits; pos++) {
            const multiplyAnswer = findMatchingAnswer(userAnswers, stepIndex, 'multiply', pos);
            if (!multiplyAnswer) return false;
        }

        // Check subtract digits
        const subtractDigits = Math.max(1, step.subtract.toString().length);
        for (let pos = 0; pos < subtractDigits; pos++) {
            const subtractAnswer = findMatchingAnswer(userAnswers, stepIndex, 'subtract', pos);
            if (!subtractAnswer) return false;
        }

        // Check bringDown if it exists
        if (step.bringDown !== undefined) {
            const bringDownAnswer = findMatchingAnswer(userAnswers, stepIndex, 'bringDown', 0);
            if (!bringDownAnswer) return false;
        }
    }

    return true;
}

export function getNextRequiredField(
    problem: DivisionProblem,
    userAnswers: UserAnswer[]
): { stepNumber: number; fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown'; fieldPosition: number } | null {
    // Find the first missing required field
    for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
        const step = problem.steps[stepIndex];

        // Check quotient
        const quotientAnswer = findMatchingAnswer(userAnswers, stepIndex, 'quotient', 0);
        if (!quotientAnswer) {
            return { stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 };
        }

        // Check multiply digits
        const multiplyDigits = step.multiply.toString().length;
        for (let pos = 0; pos < multiplyDigits; pos++) {
            const multiplyAnswer = findMatchingAnswer(userAnswers, stepIndex, 'multiply', pos);
            if (!multiplyAnswer) {
                return { stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos };
            }
        }

        // Check subtract digits
        const subtractDigits = Math.max(1, step.subtract.toString().length);
        for (let pos = 0; pos < subtractDigits; pos++) {
            const subtractAnswer = findMatchingAnswer(userAnswers, stepIndex, 'subtract', pos);
            if (!subtractAnswer) {
                return { stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos };
            }
        }

        // Check bringDown if it exists
        if (step.bringDown !== undefined) {
            const bringDownAnswer = findMatchingAnswer(userAnswers, stepIndex, 'bringDown', 0);
            if (!bringDownAnswer) {
                return { stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 };
            }
        }
    }

    return null; // All fields completed
} 