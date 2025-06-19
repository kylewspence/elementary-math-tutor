/**
 * Difficulty levels for multiplication problems
 */
export type MultiplicationDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Represents a level in the multiplication game
 */
export interface MultiplicationLevel {
    id: number;
    name: string;
    description: string;
    multiplicandDigits: number;  // Number of digits in the multiplicand (top number)
    multiplierDigits: number;    // Number of digits in the multiplier (bottom number)
    difficulty: MultiplicationDifficulty;
}

/**
 * Represents a multiplication problem
 */
export interface MultiplicationProblem {
    id: string;
    multiplicand: number;    // The number being multiplied (top number)
    multiplier: number;      // The number doing the multiplying (bottom number)
    product: number;         // The result of the multiplication
    partialProducts: PartialProduct[]; // For multi-digit multipliers
    isEditable?: boolean;    // Whether the problem can be edited by the user
    difficulty: MultiplicationDifficulty; // The difficulty level of the problem
    source?: 'api' | 'local'; // Track if problem came from API or local generation
}

/**
 * Represents a partial product in a multiplication problem
 * (when multiplier has multiple digits)
 */
export interface PartialProduct {
    multiplierDigit: number;  // The digit from the multiplier
    position: number;         // Position of the digit in the multiplier (0 = ones, 1 = tens, etc.)
    value: number;            // The partial product value
}

/**
 * Represents a user's answer to a part of a multiplication problem
 */
export interface MultiplicationUserAnswer {
    fieldType: 'product' | 'partial' | 'carry';  // Type of field (product, partial product, or carry)
    fieldPosition: number;             // Position within the field (0 = ones, 1 = tens, etc.)
    partialIndex?: number;             // Index of the partial product (if applicable)
    value: number;                     // The user's answer
    isCorrect: boolean;                // Whether the answer is correct
    timestamp: Date;                   // When the answer was submitted
}

/**
 * Represents the current focus in a multiplication problem
 */
export interface MultiplicationCurrentFocus {
    fieldType: 'product' | 'partial' | 'carry';  // Type of field (product, partial product, or carry)
    fieldPosition: number;             // Position within the field (0 = ones, 1 = tens, etc.)
    partialIndex?: number;             // Index of the partial product (if applicable)
}

/**
 * Represents the state of a multiplication game
 */
export interface MultiplicationGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: MultiplicationProblem[];
    problem: MultiplicationProblem | null;
    userAnswers: MultiplicationUserAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'multiplication';
}

/**
 * Represents a multiplication question from the API
 */
export interface MultiplicationQuestion {
    question: string;
    number_0: string;
    number_1: string;
    operator: string;
}

/**
 * Represents the API response structure for multiplication questions
 */
export interface MultiplicationQuestionsResponse {
    [key: `multiplication_${number}`]: MultiplicationQuestion[];
} 