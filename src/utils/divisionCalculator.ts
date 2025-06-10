// Core division calculation utilities

import type { DivisionProblem, DivisionStep, ProblemGenerator } from '../types/division';
import { DIVISION_CONSTANTS } from './constants';

/**
 * Performs long division and returns step-by-step breakdown
 */
export function calculateLongDivision(divisor: number, dividend: number): DivisionStep[] {
    if (divisor === 0) {
        throw new Error('Division by zero is not allowed');
    }

    const steps: DivisionStep[] = [];
    const dividendStr = dividend.toString();
    let currentDividend = 0;
    let stepNumber = 0;
    let position = 0;

    // Process each digit of the dividend
    for (let i = 0; i < dividendStr.length; i++) {
        const digit = parseInt(dividendStr[i]);
        currentDividend = currentDividend * 10 + digit;

        // If we can divide, perform the division step
        if (currentDividend >= divisor || i === dividendStr.length - 1) {
            const quotientDigit = Math.floor(currentDividend / divisor);
            const multiplyResult = quotientDigit * divisor;
            const subtractResult = currentDividend - multiplyResult;

            // Add quotient step
            steps.push({
                stepNumber: stepNumber++,
                operation: 'divide',
                value: quotientDigit,
                position: position++,
                correctAnswer: quotientDigit,
            });

            // Add multiply step
            steps.push({
                stepNumber: stepNumber++,
                operation: 'multiply',
                value: multiplyResult,
                position: i,
                correctAnswer: multiplyResult,
            });

            // Add subtract step
            steps.push({
                stepNumber: stepNumber++,
                operation: 'subtract',
                value: subtractResult,
                position: i,
                correctAnswer: subtractResult,
            });

            currentDividend = subtractResult;

            // Add bring down step if not the last digit
            if (i < dividendStr.length - 1) {
                steps.push({
                    stepNumber: stepNumber++,
                    operation: 'bringDown',
                    value: parseInt(dividendStr[i + 1]),
                    position: i + 1,
                    correctAnswer: parseInt(dividendStr[i + 1]),
                });
            }
        }
    }

    return steps;
}

/**
 * Validates a division problem for correctness
 */
export function validateDivisionProblem(problem: DivisionProblem): boolean {
    const { divisor, dividend } = problem;

    if (divisor <= 0 || dividend <= 0) return false;
    if (divisor > DIVISION_CONSTANTS.MAX_DIVISOR) return false;
    if (dividend > DIVISION_CONSTANTS.MAX_DIVIDEND) return false;

    return true;
}

/**
 * Calculates the expected quotient and remainder
 */
export function calculateQuotientAndRemainder(divisor: number, dividend: number): {
    quotient: number;
    remainder: number;
} {
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;

    return { quotient, remainder };
}

/**
 * Generates a random division problem based on difficulty settings
 */
export function generateRandomProblem(settings?: Partial<ProblemGenerator>): DivisionProblem {
    const difficulty = settings?.difficulty || 'beginner';
    const defaultSettings = DIVISION_CONSTANTS.DEFAULT_PROBLEM_SETTINGS[difficulty];

    const config = {
        ...defaultSettings,
        ...settings,
    };

    const divisor = randomInRange(config.minDivisor, config.maxDivisor);
    let dividend = randomInRange(config.minDividend, config.maxDividend);

    // Ensure clean division for beginner level
    if (!config.allowRemainders) {
        dividend = dividend - (dividend % divisor);
        if (dividend < config.minDividend) {
            dividend += divisor;
        }
    }

    const { quotient, remainder } = calculateQuotientAndRemainder(divisor, dividend);

    return {
        divisor,
        dividend,
        quotient,
        remainder,
    };
}

/**
 * Determines how many digits of the dividend are needed for the first division step
 */
export function getInitialDividendDigits(divisor: number, dividend: number): number {
    const dividendStr = dividend.toString();
    let digits = 1;
    let testValue = parseInt(dividendStr.substring(0, digits));

    while (testValue < divisor && digits < dividendStr.length) {
        digits++;
        testValue = parseInt(dividendStr.substring(0, digits));
    }

    return digits;
}

/**
 * Calculates the working area values for a specific step
 */
export function calculateWorkingAreaForStep(
    divisor: number,
    dividend: number,
    stepNumber: number
): {
    currentDividend: number;
    quotientDigit: number;
    multiplyResult: number;
    subtractResult: number;
} {
    const steps = calculateLongDivision(divisor, dividend);
    const divideSteps = steps.filter(step => step.operation === 'divide');

    if (stepNumber >= divideSteps.length) {
        throw new Error('Step number out of range');
    }

    const currentStep = divideSteps[stepNumber];
    const quotientDigit = currentStep.correctAnswer;
    const multiplyResult = quotientDigit * divisor;

    // Calculate current dividend portion
    const dividendStr = dividend.toString();
    const initialDigits = getInitialDividendDigits(divisor, dividend);
    let currentDividend: number;

    if (stepNumber === 0) {
        currentDividend = parseInt(dividendStr.substring(0, initialDigits));
    } else {
        // This is a simplified calculation - in a full implementation,
        // you'd track the remainder from previous steps
        const previousRemainder = 0; // Placeholder
        const nextDigit = parseInt(dividendStr[initialDigits + stepNumber - 1] || '0');
        currentDividend = previousRemainder * 10 + nextDigit;
    }

    const subtractResult = currentDividend - multiplyResult;

    return {
        currentDividend,
        quotientDigit,
        multiplyResult,
        subtractResult,
    };
}

/**
 * Validates a user's input for a specific step
 */
export function validateStepInput(
    divisor: number,
    dividend: number,
    stepNumber: number,
    operation: string,
    userInput: number
): boolean {
    const steps = calculateLongDivision(divisor, dividend);
    const targetStep = steps.find(step =>
        step.stepNumber === stepNumber && step.operation === operation
    );

    return targetStep ? targetStep.correctAnswer === userInput : false;
}

/**
 * Gets the next expected step in the division process
 */
export function getNextStep(
    divisor: number,
    dividend: number,
    currentStepNumber: number
): DivisionStep | null {
    const steps = calculateLongDivision(divisor, dividend);
    return steps.find(step => step.stepNumber === currentStepNumber) || null;
}

/**
 * Determines if the division problem is complete
 */
export function isDivisionComplete(
    divisor: number,
    dividend: number,
    completedSteps: number
): boolean {
    const allSteps = calculateLongDivision(divisor, dividend);
    return completedSteps >= allSteps.length;
}

// Utility functions
function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a division problem for display
 */
export function formatDivisionProblem(problem: DivisionProblem): string {
    const { divisor, dividend, quotient, remainder } = problem;
    let result = `${dividend} ÷ ${divisor}`;

    if (quotient !== undefined) {
        result += ` = ${quotient}`;
        if (remainder && remainder > 0) {
            result += ` R${remainder}`;
        }
    }

    return result;
}

/**
 * Creates a visual representation of the division layout
 */
export function createDivisionLayout(divisor: number, dividend: number): {
    divisorPosition: number;
    dividendDigits: string[];
    quotientPositions: number;
} {
    const dividendStr = dividend.toString();
    const steps = calculateLongDivision(divisor, dividend);
    const quotientSteps = steps.filter(step => step.operation === 'divide');

    return {
        divisorPosition: divisor.toString().length,
        dividendDigits: dividendStr.split(''),
        quotientPositions: quotientSteps.length,
    };
} 