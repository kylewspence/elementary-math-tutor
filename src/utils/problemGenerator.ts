import type { DivisionProblem, DivisionStep, GameLevel } from '../types/game';

export function generateProblem(level: GameLevel): DivisionProblem {
    let divisor: number;
    let dividend: number;

    // Calculate minimum and maximum values based on level constraints
    const minDivisor = Math.pow(10, level.divisorDigits - 1);
    const maxDivisor = Math.min(level.maxDivisor, Math.pow(10, level.divisorDigits) - 1);

    const minDividend = Math.pow(10, level.dividendDigits - 1);
    const maxDividend = Math.min(level.maxDividend, Math.pow(10, level.dividendDigits) - 1);

    // Generate divisor within the appropriate range
    if (level.divisorDigits === 1) {
        // Single digit: avoid 1 for more interesting problems
        divisor = Math.floor(Math.random() * (maxDivisor - 1)) + 2; // 2-9
    } else {
        // Multi-digit: use full range but avoid very small numbers
        const adjustedMin = Math.max(minDivisor, Math.floor(minDivisor * 1.1));
        divisor = Math.floor(Math.random() * (maxDivisor - adjustedMin + 1)) + adjustedMin;
    }

    // Generate dividend within the appropriate range
    const adjustedMinDividend = Math.max(minDividend, divisor * 2); // Ensure quotient is at least 2
    dividend = Math.floor(Math.random() * (maxDividend - adjustedMinDividend + 1)) + adjustedMinDividend;

    // Ensure clean division for easier levels (progressively less chance for higher levels)
    const cleanDivisionChance = Math.max(0.1, 0.8 - (level.id - 1) * 0.1);
    if (Math.random() < cleanDivisionChance) {
        // Calculate a quotient and multiply back for exact division
        const targetQuotient = Math.floor(dividend / divisor);
        if (targetQuotient > 1) {
            dividend = targetQuotient * divisor;
        }
    }

    // Calculate the actual division
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;

    // Generate step-by-step solution
    const steps = calculateDivisionSteps(dividend, divisor);

    return {
        dividend,
        divisor,
        quotient,
        remainder,
        steps,
    };
}

export function calculateDivisionSteps(dividend: number, divisor: number): DivisionStep[] {
    const steps: DivisionStep[] = [];
    const dividendStr = dividend.toString();

    let currentDividend = 0;
    let stepNumber = 0;

    // Process each digit of the dividend
    for (let digitIndex = 0; digitIndex < dividendStr.length; digitIndex++) {
        // Add the next digit to our current dividend
        currentDividend = currentDividend * 10 + parseInt(dividendStr[digitIndex]);

        // We create a step when:
        // 1. We can divide (currentDividend >= divisor), OR
        // 2. This is not the first digit (we've already started the quotient)
        const shouldCreateStep = currentDividend >= divisor || stepNumber > 0;

        if (shouldCreateStep) {
            const quotientDigit = Math.floor(currentDividend / divisor);
            const multiply = quotientDigit * divisor;
            const subtract = currentDividend - multiply;

            const step: DivisionStep = {
                stepNumber,
                dividendPart: currentDividend,
                quotientDigit,
                multiply,
                subtract,
            };

            // Add bring down for next step (if there are more digits)
            if (digitIndex + 1 < dividendStr.length) {
                step.bringDown = parseInt(dividendStr[digitIndex + 1]);
            }

            steps.push(step);
            currentDividend = subtract; // The remainder becomes the base for next step
            stepNumber++;
        }
    }

    return steps;
}

// Helper function to get problem difficulty description
export function getProblemDescription(problem: DivisionProblem): string {
    const { dividend, divisor, remainder } = problem;

    if (remainder === 0) {
        return `${dividend} ÷ ${divisor} (no remainder)`;
    } else {
        return `${dividend} ÷ ${divisor} (remainder ${remainder})`;
    }
} 