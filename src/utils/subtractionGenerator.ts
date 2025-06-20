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

        // Generate minuend (the larger number we're subtracting from)
        minuend = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

        // Generate subtrahend (the smaller number we're subtracting)
        // Ensure subtrahend is smaller than minuend to avoid negative results
        const maxSubtrahend = Math.min(minuend - 1, maxValue);
        const minSubtrahend = Math.pow(10, Math.max(1, level.maxDigits - 2)); // Slightly smaller range
        subtrahend = Math.floor(Math.random() * (maxSubtrahend - minSubtrahend + 1)) + minSubtrahend;

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
                // Modify the ones digit to ensure borrowing is needed
                const lastDigitMinuend = minuend % 10;
                const lastDigitSubtrahend = subtrahend % 10;

                if (lastDigitMinuend >= lastDigitSubtrahend) {
                    // Adjust the ones digit to ensure borrowing is needed
                    const adjustment = Math.min(9, lastDigitMinuend + 1);
                    subtrahend = subtrahend - lastDigitSubtrahend + adjustment;

                    // Ensure subtrahend is still smaller than minuend
                    if (subtrahend >= minuend) {
                        subtrahend = minuend - 1;
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
 * Calculates the step-by-step process for subtraction with borrowing
 */
export function calculateSubtractionSteps(minuend: number, subtrahend: number): SubtractionStep[] {
    const steps: SubtractionStep[] = [];

    const minuendStr = minuend.toString();
    const subtrahendStr = subtrahend.toString();

    // Determine the maximum number of digits
    const maxLength = Math.max(minuendStr.length, subtrahendStr.length);

    // Create a working copy of minuend digits for borrowing calculations
    const workingMinuend = minuendStr.split('').map(d => parseInt(d));

    // Pad with zeros on the left if needed
    while (workingMinuend.length < maxLength) {
        workingMinuend.unshift(0);
    }

    // Process each column from right to left (ones, tens, hundreds, etc.)
    for (let i = 0; i < maxLength; i++) {
        const position = maxLength - 1 - i; // Position in the working array

        // Get digits from right to left (or 0 if position doesn't exist)
        const originalMinuendDigit = parseInt(minuendStr[minuendStr.length - 1 - i] || '0');
        const subtrahendDigit = parseInt(subtrahendStr[subtrahendStr.length - 1 - i] || '0');

        let currentMinuendDigit = workingMinuend[position];
        let borrowed = 0;
        let lentTo = 0;
        let needsBorrow = false;

        // Check if we need to borrow
        if (currentMinuendDigit < subtrahendDigit) {
            needsBorrow = true;

            // Find the next non-zero digit to borrow from
            let borrowPosition = position - 1;
            while (borrowPosition >= 0 && workingMinuend[borrowPosition] === 0) {
                workingMinuend[borrowPosition] = 9; // Convert 0 to 9 when borrowing through
                borrowPosition--;
            }

            // Borrow from the found position
            if (borrowPosition >= 0) {
                workingMinuend[borrowPosition]--;
                currentMinuendDigit += 10;
                workingMinuend[position] = currentMinuendDigit;
                borrowed = 1;

                // Mark that we lent to this column
                if (borrowPosition < workingMinuend.length - 1) {
                    lentTo = 1;
                }
            }
        }

        // Calculate the difference for this column
        const difference = currentMinuendDigit - subtrahendDigit;

        // Create the step
        const step: SubtractionStep = {
            stepNumber: i,
            columnPosition: i,
            minuendDigit: originalMinuendDigit,
            subtrahendDigit,
            adjustedMinuend: currentMinuendDigit,
            difference,
            borrowed,
            lentTo,
            needsBorrow
        };

        steps.push(step);
    }

    return steps;
}

/**
 * Helper function to get subtraction problem difficulty description
 */
export function getSubtractionProblemDescription(problem: SubtractionProblem): string {
    const { minuend, subtrahend } = problem;

    // Determine if the problem involves borrowing
    const hasBorrowing = problem.steps.some(step => step.needsBorrow);

    if (hasBorrowing) {
        return `${minuend} - ${subtrahend} (with borrowing)`;
    } else {
        return `${minuend} - ${subtrahend} (no borrowing)`;
    }
} 