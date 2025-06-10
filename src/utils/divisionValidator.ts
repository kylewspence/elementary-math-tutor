import type { DivisionProblem, UserAnswer } from '../types/game';

// Helper to get digit at specific position (0 = rightmost)
function getDigitAtPosition(value: number, position: number): number {
    const str = value.toString();
    const index = str.length - 1 - position;
    return index >= 0 ? parseInt(str[index]) : 0;
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
        const quotientAnswer = userAnswers.find(
            a => a.stepNumber === stepIndex &&
                a.fieldType === 'quotient' &&
                a.fieldPosition === 0 &&
                a.isCorrect
        );
        if (!quotientAnswer) return false;

        // Check multiply digits
        const multiplyDigits = step.multiply.toString().length;
        for (let pos = 0; pos < multiplyDigits; pos++) {
            const multiplyAnswer = userAnswers.find(
                a => a.stepNumber === stepIndex &&
                    a.fieldType === 'multiply' &&
                    a.fieldPosition === pos &&
                    a.isCorrect
            );
            if (!multiplyAnswer) return false;
        }

        // Check subtract digits
        const subtractDigits = Math.max(1, step.subtract.toString().length);
        for (let pos = 0; pos < subtractDigits; pos++) {
            const subtractAnswer = userAnswers.find(
                a => a.stepNumber === stepIndex &&
                    a.fieldType === 'subtract' &&
                    a.fieldPosition === pos &&
                    a.isCorrect
            );
            if (!subtractAnswer) return false;
        }

        // Check bringDown if it exists
        if (step.bringDown !== undefined) {
            const bringDownAnswer = userAnswers.find(
                a => a.stepNumber === stepIndex &&
                    a.fieldType === 'bringDown' &&
                    a.fieldPosition === 0 &&
                    a.isCorrect
            );
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
        const quotientAnswer = userAnswers.find(
            a => a.stepNumber === stepIndex &&
                a.fieldType === 'quotient' &&
                a.fieldPosition === 0 &&
                a.isCorrect
        );
        if (!quotientAnswer) {
            return { stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 };
        }

        // Check multiply digits
        const multiplyDigits = step.multiply.toString().length;
        for (let pos = 0; pos < multiplyDigits; pos++) {
            const multiplyAnswer = userAnswers.find(
                a => a.stepNumber === stepIndex &&
                    a.fieldType === 'multiply' &&
                    a.fieldPosition === pos &&
                    a.isCorrect
            );
            if (!multiplyAnswer) {
                return { stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos };
            }
        }

        // Check subtract digits
        const subtractDigits = Math.max(1, step.subtract.toString().length);
        for (let pos = 0; pos < subtractDigits; pos++) {
            const subtractAnswer = userAnswers.find(
                a => a.stepNumber === stepIndex &&
                    a.fieldType === 'subtract' &&
                    a.fieldPosition === pos &&
                    a.isCorrect
            );
            if (!subtractAnswer) {
                return { stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos };
            }
        }

        // Check bringDown if it exists
        if (step.bringDown !== undefined) {
            const bringDownAnswer = userAnswers.find(
                a => a.stepNumber === stepIndex &&
                    a.fieldType === 'bringDown' &&
                    a.fieldPosition === 0 &&
                    a.isCorrect
            );
            if (!bringDownAnswer) {
                return { stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 };
            }
        }
    }

    return null; // All fields completed
} 