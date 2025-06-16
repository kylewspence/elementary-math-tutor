import { v4 as uuidv4 } from 'uuid';
import type { MultiplicationProblem, MultiplicationDifficulty } from '../types/multiplication';
import { DIFFICULTY_CONFIG } from './constants';

/**
 * Generates a random number within the specified range (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns A random number between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the partial products for a multiplication problem
 * @param multiplicand The first number (top number)
 * @param multiplier The second number (bottom number)
 * @returns Array of partial products with their values and positions
 */
function calculatePartialProducts(multiplicand: number, multiplier: number): MultiplicationProblem['partialProducts'] {
    const multiplierStr = multiplier.toString();
    const partialProducts = [];

    // Calculate each partial product
    for (let i = 0; i < multiplierStr.length; i++) {
        const digit = parseInt(multiplierStr[multiplierStr.length - 1 - i], 10);
        const value = multiplicand * digit;

        // Add to partial products with position
        partialProducts.push({
            value,
            position: i, // Position from right to left
            multiplierDigit: digit
        });
    }

    return partialProducts;
}

/**
 * Generates a random multiplication problem based on the specified difficulty
 * @param difficulty The difficulty level of the problem
 * @returns A multiplication problem object
 */
export function generateMultiplicationProblem(difficulty: MultiplicationDifficulty): MultiplicationProblem {
    // Get difficulty configuration
    const config = DIFFICULTY_CONFIG.multiplication[difficulty];

    // Generate multiplicand (top number)
    const multiplicandMin = Math.pow(10, config.multiplicandDigits - 1);
    const multiplicandMax = Math.pow(10, config.multiplicandDigits) - 1;
    const multiplicand = getRandomInt(multiplicandMin, multiplicandMax);

    // Generate multiplier (bottom number)
    const multiplierMin = Math.pow(10, config.multiplierDigits - 1);
    const multiplierMax = Math.pow(10, config.multiplierDigits) - 1;
    const multiplier = getRandomInt(multiplierMin, multiplierMax);

    // Calculate product
    const product = multiplicand * multiplier;

    // Calculate partial products
    const partialProducts = calculatePartialProducts(multiplicand, multiplier);

    return {
        id: uuidv4(),
        multiplicand,
        multiplier,
        product,
        partialProducts,
        difficulty,
        isEditable: false,
    };
}

/**
 * Generates a specific multiplication problem with predefined numbers
 * @param multiplicand The first number (top number)
 * @param multiplier The second number (bottom number)
 * @param difficulty The difficulty level to assign
 * @returns A multiplication problem object
 */
export function createSpecificMultiplicationProblem(
    multiplicand: number,
    multiplier: number,
    difficulty: MultiplicationDifficulty = 'medium'
): MultiplicationProblem {
    // Calculate product
    const product = multiplicand * multiplier;

    // Calculate partial products
    const partialProducts = calculatePartialProducts(multiplicand, multiplier);

    return {
        id: uuidv4(),
        multiplicand,
        multiplier,
        product,
        partialProducts,
        difficulty,
        isEditable: false,
    };
} 