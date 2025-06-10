import type { DivisionProblem, DivisionStep, GameLevel } from '../types/game';

export function generateProblem(level: GameLevel): DivisionProblem {
    let divisor: number;
    let dividend: number;

    // Generate appropriate numbers for the level
    if (level.id === 1) {
        // Level 1: Single digit divisor, 2-digit dividend
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        dividend = Math.floor(Math.random() * 80) + 20; // 20-99
    } else if (level.id === 2) {
        // Level 2: Single digit divisor, 3-digit dividend  
        divisor = Math.floor(Math.random() * 7) + 3; // 3-9
        dividend = Math.floor(Math.random() * 800) + 100; // 100-899
    } else if (level.id === 3) {
        // Level 3: Single digit divisor, 4-digit dividend
        divisor = Math.floor(Math.random() * 6) + 4; // 4-9
        dividend = Math.floor(Math.random() * 8000) + 1000; // 1000-8999
    } else {
        // Level 4: Two digit divisor, 3-4 digit dividend
        divisor = Math.floor(Math.random() * 80) + 11; // 11-90
        dividend = Math.floor(Math.random() * 8000) + 200; // 200-8199
    }

    // Ensure clean division for simpler problems (levels 1-2)
    if (level.id <= 2 && Math.random() < 0.7) {
        // 70% chance of no remainder for easier levels
        const quotient = Math.floor(dividend / divisor);
        dividend = quotient * divisor;
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
    let digitIndex = 0;

    while (digitIndex < dividendStr.length) {
        // Build up the current dividend part by adding the next digit
        currentDividend = currentDividend * 10 + parseInt(dividendStr[digitIndex]);

        // If current dividend is large enough to divide, or we're at the last digit
        if (currentDividend >= divisor || digitIndex === dividendStr.length - 1) {
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

        digitIndex++;
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