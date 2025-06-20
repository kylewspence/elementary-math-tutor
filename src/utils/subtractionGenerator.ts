import type { SubtractionProblem, SubtractionStep, SubtractionLevel } from '../types/subtraction';

/**
 * Generates a subtraction problem based on the level parameters
 */
export function generateSubtractionProblem(level: SubtractionLevel, specificMinuend?: number, specificSubtrahend?: number): SubtractionProblem {
    // If specific values are provided, use them
    let minuend: number;
    let subtrahend: number;

    if (specificMinuend !== undefined && specificSubtrahend !== undefined) {
        minuend = specificMinuend;
        subtrahend = specificSubtrahend;
    } else {
        // Generate two numbers based on level difficulty
        const maxValue = level.maxValue;
        const minValue = Math.pow(10, level.maxDigits - 1); // Ensure minimum digits

        minuend = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        subtrahend = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

        // Ensure minuend >= subtrahend for valid subtraction
        if (minuend < subtrahend) {
            [minuend, subtrahend] = [subtrahend, minuend];
        }

        // If borrowing is required for this level, ensure at least one column needs borrowing
        if (level.borrowRequired) {
            let hasBorrow = false;

            // Check if any column would require borrowing
            const minuendStr = minuend.toString();
            const subtrahendStr = subtrahend.toString();
            const maxLength = Math.max(minuendStr.length, subtrahendStr.length);

            for (let i = 0; i < maxLength; i++) {
                const digit1 = parseInt(minuendStr[minuendStr.length - 1 - i] || '0');
                const digit2 = parseInt(subtrahendStr[subtrahendStr.length - 1 - i] || '0');

                if (digit1 < digit2) {
                    hasBorrow = true;
                    break;
                }
            }

            // If no borrowing found, modify the numbers to ensure at least one borrow
            if (!hasBorrow) {
                // Modify the ones digit to ensure a borrow
                const lastDigit1 = minuend % 10;
                const lastDigit2 = subtrahend % 10;

                if (lastDigit1 >= lastDigit2) {
                    // Adjust the ones digit to ensure it needs borrowing
                    const adjustment = lastDigit2 - lastDigit1 + 1;
                    subtrahend = subtrahend - lastDigit2 + lastDigit2 + adjustment;

                    // Ensure we don't exceed minuend
                    if (subtrahend > minuend) {
                        minuend = subtrahend + Math.floor(Math.random() * 100) + 1;
                    }
                }
            }
        }
    }

    // Calculate the difference
    const difference = minuend - subtrahend;

    // Generate step-by-step solution
    const steps = calculateSubtractionSteps(minuend, subtrahend);

    return {
        minuend,
        subtrahend,
        difference,
        steps,
        isEditable: false,
        source: 'local',
    };
}

/**
 * Calculates the step-by-step process for subtraction
 */
export function calculateSubtractionSteps(minuend: number, subtrahend: number): SubtractionStep[] {
    const steps: SubtractionStep[] = [];

    const minuendStr = minuend.toString();
    const subtrahendStr = subtrahend.toString();

    // Determine the maximum number of digits
    const maxLength = Math.max(minuendStr.length, subtrahendStr.length);

    let borrowValue = 0; // Initialize borrow

    // Process each column from right to left (ones, tens, hundreds, etc.)
    for (let i = 0; i < maxLength; i++) {
        // Get digits from right to left (or 0 if position doesn't exist)
        const digit1 = parseInt(minuendStr[minuendStr.length - 1 - i] || '0');
        const digit2 = parseInt(subtrahendStr[subtrahendStr.length - 1 - i] || '0');

        // Adjust digit1 for any borrow from previous column
        let adjustedDigit1 = digit1 - borrowValue;

        // Determine if we need to borrow from the next column
        let nextBorrow = 0;
        if (adjustedDigit1 < digit2) {
            adjustedDigit1 += 10;
            nextBorrow = 1;
        }

        // Calculate the difference digit
        const differenceDigit = adjustedDigit1 - digit2;

        // Create the step
        const step: SubtractionStep = {
            stepNumber: i,
            columnPosition: i,
            digit1,
            digit2,
            difference: differenceDigit,
            borrow: nextBorrow,
            borrowReceived: borrowValue
        };

        steps.push(step);

        // Update borrow for next iteration
        borrowValue = nextBorrow;
    }

    return steps;
}

/**
 * Helper function to get subtraction problem difficulty description
 */
export function getSubtractionProblemDescription(problem: SubtractionProblem): string {
    const { minuend, subtrahend } = problem;

    // Determine if the problem involves borrowing
    const hasBorrowing = problem.steps.some(step => step.borrow > 0);

    if (hasBorrowing) {
        return `${minuend} - ${subtrahend} (with borrowing)`;
    } else {
        return `${minuend} - ${subtrahend} (no borrowing)`;
    }
} 