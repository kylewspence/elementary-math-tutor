import type { AdditionProblem, AdditionStep, AdditionLevel } from '../types/addition';

/**
 * Generates an addition problem based on the level parameters
 */
export function generateAdditionProblem(level: AdditionLevel): AdditionProblem {
    // Generate two numbers based on level difficulty
    const maxValue = level.maxValue;
    const minValue = Math.pow(10, level.maxDigits - 1); // Ensure minimum digits

    const addend1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    let addend2 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

    // If carry is required for this level, ensure at least one column needs carrying
    if (level.carryRequired) {
        let hasCarry = false;

        // Check if any column would require carrying
        const addend1Str = addend1.toString();
        const addend2Str = addend2.toString();
        const maxLength = Math.max(addend1Str.length, addend2Str.length);

        for (let i = 0; i < maxLength; i++) {
            const digit1 = parseInt(addend1Str[addend1Str.length - 1 - i] || '0');
            const digit2 = parseInt(addend2Str[addend2Str.length - 1 - i] || '0');

            if (digit1 + digit2 >= 10) {
                hasCarry = true;
                break;
            }
        }

        // If no carry found, modify the numbers to ensure at least one carry
        if (!hasCarry) {
            // Modify the ones digit to ensure a carry
            const lastDigit1 = addend1 % 10;
            const lastDigit2 = addend2 % 10;

            if (lastDigit1 + lastDigit2 < 10) {
                // Adjust the ones digit to ensure it carries
                const adjustment = 10 - (lastDigit1 + lastDigit2);
                addend2 = addend2 - lastDigit2 + lastDigit2 + adjustment;
            }
        }
    }

    // Calculate the sum
    const sum = addend1 + addend2;

    // Generate step-by-step solution
    const steps = calculateAdditionSteps(addend1, addend2);

    return {
        addend1,
        addend2,
        sum,
        steps,
        isEditable: false
    };
}

/**
 * Calculates the step-by-step process for addition
 */
export function calculateAdditionSteps(addend1: number, addend2: number): AdditionStep[] {
    const steps: AdditionStep[] = [];

    const addend1Str = addend1.toString();
    const addend2Str = addend2.toString();

    // Determine the maximum number of digits
    const maxLength = Math.max(addend1Str.length, addend2Str.length);

    let carryValue = 0; // Initialize carry

    // Process each column from right to left (ones, tens, hundreds, etc.)
    for (let i = 0; i < maxLength; i++) {
        // Get digits from right to left (or 0 if position doesn't exist)
        const digit1 = parseInt(addend1Str[addend1Str.length - 1 - i] || '0');
        const digit2 = parseInt(addend2Str[addend2Str.length - 1 - i] || '0');

        // Calculate column sum including any carry from previous column
        const columnSum = digit1 + digit2 + carryValue;

        // Determine if we need to carry to the next column
        const nextCarry = columnSum >= 10 ? 1 : 0;

        // The digit that goes in the sum (ones digit of columnSum)
        const sumDigit = columnSum % 10;

        // Create the step
        const step: AdditionStep = {
            stepNumber: i,
            columnPosition: i,
            digit1,
            digit2,
            sum: sumDigit,
            carry: nextCarry,
            carryReceived: carryValue
        };

        steps.push(step);

        // Update carry for next iteration
        carryValue = nextCarry;
    }

    // If there's a final carry, add it as the most significant digit
    if (carryValue > 0) {
        steps.push({
            stepNumber: maxLength,
            columnPosition: maxLength,
            digit1: 0,
            digit2: 0,
            sum: carryValue,
            carry: 0,
            carryReceived: 0
        });
    }

    return steps;
}

/**
 * Helper function to get addition problem difficulty description
 */
export function getAdditionProblemDescription(problem: AdditionProblem): string {
    const { addend1, addend2 } = problem;

    // Determine if the problem involves carrying
    const hasCarrying = problem.steps.some(step => step.carry > 0);

    if (hasCarrying) {
        return `${addend1} + ${addend2} (with carrying)`;
    } else {
        return `${addend1} + ${addend2} (no carrying)`;
    }
} 