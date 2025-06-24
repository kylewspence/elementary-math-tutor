import type { DivisionProblem } from '../types/game';
import type { MultiplicationProblem, MultiplicationQuestion } from '../types/multiplication';
import type { AdditionProblem } from '../types/addition';
import type { SubtractionProblem } from '../types/subtraction';
import { calculateDivisionSteps } from './problemGenerator';
import { calculateAdditionSteps } from './additionGenerator';
import { calculateSubtractionSteps } from './subtractionGenerator';

import { API_CONFIG } from './config';
import { v4 as uuidv4 } from 'uuid';
import { logApiCallStart, logApiCallEnd } from './apiCallLogger';
import { cachedApiService } from './apiCache';

// API call tracking
let apiCallCount = 0;

/**
 * Gets the current API call count (useful for debugging)
 */
export function getApiCallCount(): number {
    return apiCallCount;
}

/**
 * Resets the API call counter (useful for testing)
 */
export function resetApiCallCount(): void {
    apiCallCount = 0;
    console.log('🔄 API call counter reset to 0');
}

interface MathQuestion {
    question: string;
    number_0: string;
    number_1: string;
    operator: string;
}

interface ApiResponse {
    tag: string;
    public: {
        addition_0: MathQuestion[];
        addition_1: MathQuestion[];
        addition_2: MathQuestion[];
        multiplication_0: MathQuestion[];
        multiplication_1: MathQuestion[];
        multiplication_2: MathQuestion[];
        division_0: MathQuestion[];
        division_1: MathQuestion[];
        division_2: MathQuestion[];
        [key: string]: MathQuestion[];
    };
}

// API endpoint for fetching math problems
const API_ENDPOINT = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATH_PROBLEMS}`;

/**
 * Fetches math problems from the server
 */
export async function fetchMathProblems(): Promise<ApiResponse> {
    // Start logging the API call
    const callId = logApiCallStart(
        API_ENDPOINT,
        'POST',
        'fetchMathProblems'
    );

    // Increment and log API call count (legacy counter)
    apiCallCount++;
    console.log(`🌐 API CALL #${apiCallCount} - Fetching math problems from server`);

    // Check if API configuration is complete
    if (!API_CONFIG.BASE_URL || !API_CONFIG.DEVICE_ID) {
        const error = 'API configuration incomplete - falling back to local generation';
        console.error('API configuration incomplete:', {
            BASE_URL: API_CONFIG.BASE_URL,
            DEVICE_ID: API_CONFIG.DEVICE_ID
        });
        logApiCallEnd(callId, false, error);
        throw new Error(error);
    }

    try {
        // Use the correct JSON structure as specified by the API documentation
        const requestBody = {
            "tag": "publicmath.get",
            "deviceid": API_CONFIG.DEVICE_ID
        };

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = `HTTP error! status: ${response.status}`;
            console.error('API HTTP error:', response.status, response.statusText);
            logApiCallEnd(callId, false, error);
            throw new Error(error);
        }

        const data = await response.json();

        // Check if the response has the expected structure
        if (!data || !data.public) {
            console.error('API returned unexpected structure. Expected: { public: {...} }, Got:', data);

            // More specific error messages based on what we got
            if (data && typeof data === 'object') {
                const keys = Object.keys(data);
                console.error('Response contains keys:', keys);

                if (keys.includes('yeah') || keys.includes('mustadd')) {
                    const error = 'API endpoint appears to be returning test/placeholder data instead of math problems';
                    logApiCallEnd(callId, false, error);
                    throw new Error(error);
                }
            }

            const error = `API response does not have expected structure. Got: ${JSON.stringify(data)}`;
            logApiCallEnd(callId, false, error);
            throw new Error(error);
        }

        // Validate that the public object has the expected math problem arrays
        const expectedKeys = ['division_0', 'division_1', 'division_2', 'multiplication_0', 'multiplication_1', 'multiplication_2', 'addition_0', 'addition_1', 'addition_2'];
        const actualKeys = Object.keys(data.public);
        const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));

        if (missingKeys.length > 0) {
            console.error('API response missing expected problem types:', missingKeys);
            console.error('Available keys in public object:', actualKeys);
            const error = `API response missing expected problem types: ${missingKeys.join(', ')}`;
            logApiCallEnd(callId, false, error);
            throw new Error(error);
        }

        // Success!
        logApiCallEnd(callId, true);
        return data;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logApiCallEnd(callId, false, errorMessage);
        throw error;
    }
}

/**
 * Converts raw API response to AdditionProblem format
 */
function convertToAdditionProblem(question: MathQuestion): AdditionProblem {
    // For addition, number_0 is the first addend and number_1 is the second addend
    const addend1 = parseInt(question.number_0);
    const addend2 = parseInt(question.number_1);

    // Calculate the sum
    const sum = addend1 + addend2;

    // Calculate steps using imported function
    const steps = calculateAdditionSteps(addend1, addend2);

    return {
        addend1,
        addend2,
        sum,
        steps,
        source: 'api', // Mark as coming from API
    };
}

/**
 * Converts raw API response to SubtractionProblem format
 */
function convertToSubtractionProblem(question: MathQuestion): SubtractionProblem {
    // For subtraction, number_0 is the minuend and number_1 is the subtrahend
    let minuend = parseInt(question.number_0);
    let subtrahend = parseInt(question.number_1);

    // Ensure minuend >= subtrahend for valid subtraction
    if (minuend < subtrahend) {
        [minuend, subtrahend] = [subtrahend, minuend];
    }

    // Calculate the difference
    const difference = minuend - subtrahend;

    // Calculate steps using imported function
    const steps = calculateSubtractionSteps(minuend, subtrahend);

    return {
        minuend,
        subtrahend,
        difference,
        steps,
        source: 'api', // Mark as coming from API
    };
}

/**
 * Validates if a division problem is suitable for long division practice
 */
function isValidDivisionProblem(dividend: number, divisor: number): boolean {
    // Reject problems with zero or negative divisor
    if (divisor <= 0) {
        return false;
    }

    // Reject problems with negative dividend
    if (dividend < 0) {
        return false;
    }

    // Reject problems where dividend is smaller than divisor
    // These result in quotient 0 and don't make sense for long division practice
    if (dividend < divisor) {
        return false;
    }

    // Reject problems where dividend equals divisor (always results in quotient 1)
    // These are too trivial for practice
    if (dividend === divisor) {
        return false;
    }

    return true;
}

/**
 * Converts raw API response to DivisionProblem format
 */
function convertToDivisionProblem(question: MathQuestion): DivisionProblem | null {
    // For division, number_0 is the dividend and number_1 is the divisor
    const dividend = parseInt(question.number_0);
    const divisor = parseInt(question.number_1);

    // Validate the problem
    if (!isValidDivisionProblem(dividend, divisor)) {
        return null;
    }

    // Calculate the quotient and remainder
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;

    // Calculate steps using imported function
    const steps = calculateDivisionSteps(dividend, divisor);

    return {
        dividend,
        divisor,
        quotient,
        remainder,
        steps,
        source: 'api', // Mark as coming from API
    };
}

/**
 * Converts an API question to a multiplication problem format
 */
export function convertToMultiplicationProblem(question: MultiplicationQuestion): MultiplicationProblem {
    // For multiplication, number_0 is the multiplicand and number_1 is the multiplier
    const multiplicand = parseInt(question.number_0);
    const multiplier = parseInt(question.number_1);
    const product = multiplicand * multiplier;

    // Generate partial products
    const partialProducts = [];
    const multiplierStr = multiplier.toString();

    for (let i = 0; i < multiplierStr.length; i++) {
        const position = multiplierStr.length - 1 - i; // 0 for ones, 1 for tens, etc.
        const multiplierDigit = parseInt(multiplierStr[i], 10);
        const value = multiplicand * multiplierDigit * Math.pow(10, position);

        partialProducts.push({
            multiplierDigit,
            position,
            value,
        });
    }

    const multiplicationProblem: MultiplicationProblem = {
        id: uuidv4(),
        multiplicand,
        multiplier,
        product,
        partialProducts,
        isEditable: false,
        difficulty: 'medium',
        source: 'api', // Mark as coming from API
    };

    // Calculate actual difficulty based on the problem
    const difficultyScore = evaluateMultiplicationDifficulty(multiplicationProblem);
    multiplicationProblem.difficulty = difficultyScore <= 3 ? 'easy' : difficultyScore <= 7 ? 'medium' : 'hard';

    return multiplicationProblem;
}

/**
 * Evaluates the difficulty of an addition problem
 * @returns A difficulty score from 1-10
 */
function evaluateAdditionDifficulty(problem: AdditionProblem): number {
    let difficulty = 1;

    // Factor 1: Number of digits in addends
    const addend1Digits = problem.addend1.toString().length;
    const addend2Digits = problem.addend2.toString().length;
    const maxDigits = Math.max(addend1Digits, addend2Digits);
    difficulty += maxDigits - 1;

    // Factor 2: Carrying complexity
    let carriesCount = 0;
    problem.steps.forEach(step => {
        if (step.carry > 0) {
            carriesCount++;
        }
    });
    difficulty += carriesCount;

    // Factor 3: Size of sum
    const sumDigits = problem.sum.toString().length;
    if (sumDigits > maxDigits) {
        difficulty += 1; // Extra point for sum being longer than addends
    }

    // Cap the difficulty between 1 and 10
    return Math.max(1, Math.min(10, difficulty));
}

/**
 * Evaluates the difficulty of a subtraction problem
 * @returns A difficulty score from 1-10
 */
function evaluateSubtractionDifficulty(problem: SubtractionProblem): number {
    let difficulty = 1;

    // Factor 1: Number of digits in operands
    const minuendDigits = problem.minuend.toString().length;
    const subtrahendDigits = problem.subtrahend.toString().length;
    const maxDigits = Math.max(minuendDigits, subtrahendDigits);
    difficulty += maxDigits - 1;

    // Factor 2: Borrowing complexity
    let borrowsCount = 0;
    problem.steps.forEach(step => {
        if (step.borrow > 0) {
            borrowsCount++;
        }
    });
    difficulty += borrowsCount;

    // Factor 3: Size of numbers
    if (problem.minuend > 1000) {
        difficulty += 1;
    }

    // Cap the difficulty between 1 and 10
    return Math.max(1, Math.min(10, difficulty));
}

/**
 * Evaluates the difficulty of a division problem
 * @returns A difficulty score from 1-10
 */
function evaluateDivisionDifficulty(problem: DivisionProblem): number {
    let difficulty = 1;

    // Factor 1: Number of digits in divisor
    const divisorDigits = problem.divisor.toString().length;
    difficulty += (divisorDigits - 1) * 2;

    // Factor 2: Number of digits in dividend
    const dividendDigits = problem.dividend.toString().length;
    difficulty += dividendDigits - divisorDigits;

    // Factor 3: Remainder
    if (problem.remainder > 0) {
        difficulty += 1;
    }

    // Factor 4: Size of quotient
    if (problem.quotient > 10) {
        difficulty += 1;
    }

    // Factor 5: Division complexity (if divisor doesn't easily go into dividend)
    if (problem.dividend % problem.divisor !== 0) {
        difficulty += 1;
    }

    // Cap the difficulty between 1 and 10
    return Math.max(1, Math.min(10, difficulty));
}

/**
 * Evaluates the difficulty of a multiplication problem
 * @returns A difficulty score from 1-10
 */
function evaluateMultiplicationDifficulty(problem: MultiplicationProblem): number {
    let difficulty = 1;

    // Factor 1: Number of digits in multiplicand
    const multiplicandDigits = problem.multiplicand.toString().length;
    difficulty += multiplicandDigits - 1;

    // Factor 2: Number of digits in multiplier
    const multiplierDigits = problem.multiplier.toString().length;
    difficulty += multiplierDigits - 1;

    // Factor 3: Size of product
    const productDigits = problem.product.toString().length;
    if (productDigits >= 4) {
        difficulty += 1;
    }
    if (productDigits >= 6) {
        difficulty += 1;
    }

    // Factor 4: Carrying complexity
    // Check if there are carries in the multiplication
    let hasCarries = false;
    for (let i = 0; i < problem.multiplicand.toString().length; i++) {
        for (let j = 0; j < problem.multiplier.toString().length; j++) {
            const digit1 = parseInt(problem.multiplicand.toString()[i]);
            const digit2 = parseInt(problem.multiplier.toString()[j]);
            if (digit1 * digit2 >= 10) {
                hasCarries = true;
                break;
            }
        }
        if (hasCarries) break;
    }
    if (hasCarries) {
        difficulty += 1;
    }

    // Cap the difficulty between 1 and 10
    return Math.max(1, Math.min(10, difficulty));
}

/**
 * Generates a unique identifier for a division problem to detect duplicates
 */
function getProblemKey(problem: DivisionProblem | MultiplicationProblem): string {
    if ('dividend' in problem) {
        // It's a division problem
        return `div_${problem.dividend}_${problem.divisor}`;
    } else {
        // It's a multiplication problem
        return `mul_${problem.multiplicand}_${problem.multiplier}`;
    }
}

/**
 * Enforces minimum complexity requirements for each level
 */
function meetsLevelRequirements(problem: DivisionProblem, levelId: number): boolean {
    // For Level 1, accept any valid problem
    if (levelId <= 1) return true;

    const divisorDigits = problem.divisor.toString().length;
    const dividendDigits = problem.dividend.toString().length;

    // Level 2: Single digit divisor, 2+ digit dividend (relaxed from 3+)
    if (levelId === 2) {
        return divisorDigits === 1 && dividendDigits >= 2;
    }

    // Level 3: Single digit divisor, 3+ digit dividend (relaxed from 4+)
    if (levelId === 3) {
        return divisorDigits === 1 && dividendDigits >= 3;
    }

    // Level 4: Single or two-digit divisor, 3+ digit dividend (more flexible)
    if (levelId === 4) {
        return (divisorDigits >= 1 && dividendDigits >= 3) &&
            (divisorDigits === 2 || (divisorDigits === 1 && dividendDigits >= 4));
    }

    // Level 5+: Accept more complex problems
    return (divisorDigits >= 1 && dividendDigits >= 3) &&
        (divisorDigits >= 2 || dividendDigits >= 4);
}

/**
 * Enforces minimum complexity requirements for each level of multiplication problems
 */
function meetsMultiplicationLevelRequirements(problem: MultiplicationProblem, levelId: number): boolean {
    // For Level 1, accept any valid problem
    if (levelId <= 1) return true;

    const multiplicandDigits = problem.multiplicand.toString().length;
    const multiplierDigits = problem.multiplier.toString().length;

    // Level 2: Single digit multiplier, 2+ digit multiplicand
    if (levelId === 2) {
        return multiplierDigits === 1 && multiplicandDigits >= 2;
    }

    // Level 3: Single digit multiplier, 3+ digit multiplicand
    if (levelId === 3) {
        return multiplierDigits === 1 && multiplicandDigits >= 3;
    }

    // Level 4: Two-digit multiplier, 2+ digit multiplicand
    if (levelId === 4) {
        return multiplierDigits === 2 && multiplicandDigits >= 2;
    }

    // Level 5+: More complex problems
    return (multiplierDigits >= 2 && multiplicandDigits >= 2);
}

/**
 * Checks if an addition problem meets the requirements for a specific level
 */
function meetsAdditionLevelRequirements(problem: AdditionProblem, levelId: number): boolean {
    const addend1Digits = problem.addend1.toString().length;
    const addend2Digits = problem.addend2.toString().length;
    const maxDigits = Math.max(addend1Digits, addend2Digits);

    // Count carries needed
    const carriesCount = problem.steps.filter(step => step.carry > 0).length;

    // Level-specific requirements
    switch (levelId) {
        case 1:
            // Level 1: 2-digit numbers, minimal carrying
            return maxDigits === 2 && carriesCount <= 1;
        case 2:
            // Level 2: 2-3 digit numbers, some carrying
            return maxDigits <= 3 && carriesCount <= 2;
        case 3:
            // Level 3: 3-digit numbers, moderate carrying
            return maxDigits <= 3 && carriesCount <= 3;
        case 4:
        case 5:
            // Level 4-5: 3-4 digit numbers, more carrying
            return maxDigits <= 4 && carriesCount <= 4;
        default:
            // Higher levels: any complexity
            return true;
    }
}

/**
 * Checks if a subtraction problem meets the requirements for a specific level
 */
function meetsSubtractionLevelRequirements(problem: SubtractionProblem, levelId: number): boolean {
    const minuendDigits = problem.minuend.toString().length;
    const subtrahendDigits = problem.subtrahend.toString().length;
    const maxDigits = Math.max(minuendDigits, subtrahendDigits);

    // Count borrows needed
    const borrowsCount = problem.steps.filter(step => step.borrow > 0).length;

    // Level-specific requirements (relaxed to allow more problems)
    switch (levelId) {
        case 1:
            // Level 1: 2-digit numbers, any borrowing level
            return maxDigits <= 2;

        case 2:
            // Level 2: 2-3 digit numbers, any borrowing level
            return maxDigits <= 3;

        case 3:
            // Level 3: 2-3 digit numbers, any borrowing level
            return maxDigits <= 3;

        case 4:
            // Level 4: 3-digit numbers, any borrowing level
            return maxDigits <= 4;

        default:
            // Higher levels: any complexity
            return true;
    }
}

/**
 * Filters division problems to ensure they match the expected difficulty level and removes duplicates
 */
function filterProblemsForLevel(problems: DivisionProblem[], levelId: number): DivisionProblem[] {
    // Create a map to track unique problems
    const uniqueProblems = new Map<string, DivisionProblem>();

    // More flexible difficulty ranges
    let minDifficulty = 1;
    let maxDifficulty = 10; // Allow all difficulties initially

    // Adjust ranges based on level but be more inclusive
    if (levelId === 1) {
        minDifficulty = 1;
        maxDifficulty = 4;
    } else if (levelId === 2) {
        minDifficulty = 2;
        maxDifficulty = 6;
    } else if (levelId === 3) {
        minDifficulty = 3;
        maxDifficulty = 7;
    } else if (levelId >= 4) {
        minDifficulty = 3;
        maxDifficulty = 10;
    }

    for (const problem of problems) {
        const key = getProblemKey(problem);

        // Skip duplicates
        if (uniqueProblems.has(key)) {
            continue;
        }

        // Evaluate difficulty
        const difficulty = evaluateDivisionDifficulty(problem);

        // Check difficulty range
        if (difficulty < minDifficulty || difficulty > maxDifficulty) {
            continue;
        }

        // Check level requirements
        if (!meetsLevelRequirements(problem, levelId)) {
            continue;
        }

        // Add to unique problems
        uniqueProblems.set(key, problem);
    }

    return Array.from(uniqueProblems.values());
}

/**
 * Filters multiplication problems to ensure they match the expected difficulty level and removes duplicates
 */
function filterMultiplicationProblemsForLevel(problems: MultiplicationProblem[], levelId: number): MultiplicationProblem[] {
    // Create a map to track unique problems
    const uniqueProblems = new Map<string, MultiplicationProblem>();

    // More flexible difficulty ranges
    let minDifficulty = 1;
    let maxDifficulty = 10; // Allow all difficulties initially

    // Adjust ranges based on level but be more inclusive
    if (levelId === 1) {
        minDifficulty = 1;
        maxDifficulty = 4;
    } else if (levelId === 2) {
        minDifficulty = 2;
        maxDifficulty = 6;
    } else if (levelId === 3) {
        minDifficulty = 3;
        maxDifficulty = 7;
    } else if (levelId >= 4) {
        minDifficulty = 3;
        maxDifficulty = 10;
    }

    // Filter problems
    for (const problem of problems) {
        const difficulty = evaluateMultiplicationDifficulty(problem);
        const key = getProblemKey(problem);

        // Check each filter condition separately
        if (difficulty >= minDifficulty &&
            difficulty <= maxDifficulty &&
            !uniqueProblems.has(key) &&
            meetsMultiplicationLevelRequirements(problem, levelId)) {
            uniqueProblems.set(key, problem);
        }
    }

    // Return unique problems that meet criteria
    return Array.from(uniqueProblems.values());
}

/**
 * Filters addition problems to ensure they match the expected difficulty level and removes duplicates
 */
function filterAdditionProblemsForLevel(problems: AdditionProblem[], levelId: number): AdditionProblem[] {
    // Create a map to track unique problems
    const uniqueProblems = new Map<string, AdditionProblem>();

    // More flexible difficulty ranges
    let minDifficulty = 1;
    let maxDifficulty = 10; // Allow all difficulties initially

    // Adjust ranges based on level but be more inclusive
    if (levelId === 1) {
        minDifficulty = 1;
        maxDifficulty = 4;
    } else if (levelId === 2) {
        minDifficulty = 2;
        maxDifficulty = 6;
    } else if (levelId === 3) {
        minDifficulty = 3;
        maxDifficulty = 7;
    } else if (levelId >= 4) {
        minDifficulty = 3;
        maxDifficulty = 10;
    }

    // Filter problems
    for (const problem of problems) {
        const difficulty = evaluateAdditionDifficulty(problem);
        const key = `add_${problem.addend1}_${problem.addend2}`;

        // Check each filter condition separately
        if (difficulty >= minDifficulty &&
            difficulty <= maxDifficulty &&
            !uniqueProblems.has(key) &&
            meetsAdditionLevelRequirements(problem, levelId)) {
            uniqueProblems.set(key, problem);
        }
    }

    // Return unique problems that meet criteria
    return Array.from(uniqueProblems.values());
}

/**
 * Filters subtraction problems to ensure they match the expected difficulty level and removes duplicates
 */
function filterSubtractionProblemsForLevel(problems: SubtractionProblem[], levelId: number): SubtractionProblem[] {
    // Create a map to track unique problems
    const uniqueProblems = new Map<string, SubtractionProblem>();

    // More flexible difficulty ranges
    let minDifficulty = 1;
    let maxDifficulty = 10; // Allow all difficulties initially

    // Adjust ranges based on level but be more inclusive
    if (levelId === 1) {
        minDifficulty = 1;
        maxDifficulty = 4;
    } else if (levelId === 2) {
        minDifficulty = 2;
        maxDifficulty = 6;
    } else if (levelId === 3) {
        minDifficulty = 3;
        maxDifficulty = 7;
    } else if (levelId >= 4) {
        minDifficulty = 3;
        maxDifficulty = 10;
    }

    // Filter problems
    for (const problem of problems) {
        const difficulty = evaluateSubtractionDifficulty(problem);
        const key = `sub_${problem.minuend}_${problem.subtrahend}`;

        // Check each filter condition separately
        if (difficulty >= minDifficulty &&
            difficulty <= maxDifficulty &&
            !uniqueProblems.has(key) &&
            meetsSubtractionLevelRequirements(problem, levelId)) {
            uniqueProblems.set(key, problem);
        }
    }

    // Return unique problems that meet criteria
    return Array.from(uniqueProblems.values());
}

/**
 * Fetches division problems for a specific level
 */
export async function fetchDivisionProblems(level: number): Promise<DivisionProblem[]> {
    const callId = logApiCallStart(
        'Cached Division Problems',
        'GET',
        'fetchDivisionProblems',
        level
    );

    try {
        console.log(`📊 Fetching division problems for level ${level} using cached service`);

        // Use cached service instead of direct API call
        const problems = await cachedApiService.getFilteredProblems('division', level);

        // Convert raw API data to DivisionProblem format
        const divisionProblems: DivisionProblem[] = problems.map((problem: any) => {
            // Convert API format to MathQuestion format first
            const mathQuestion: MathQuestion = {
                question: problem.question,
                number_0: problem.number_0,
                number_1: problem.number_1,
                operator: problem.operator
            };

            // Use the existing conversion function
            return convertToDivisionProblem(mathQuestion);
        }).filter((problem): problem is DivisionProblem => problem !== null);

        // Filter problems for the specific level
        const filteredProblems = filterProblemsForLevel(divisionProblems, level);

        console.log(`📊 Converted ${problems.length} raw problems to ${filteredProblems.length} filtered division problems for level ${level}`);

        logApiCallEnd(callId, true);
        return filteredProblems;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching division problems:', errorMessage);
        logApiCallEnd(callId, false, errorMessage);
        throw error;
    }
}

/**
 * Fetches multiplication problems for a specific level
 */
export async function fetchMultiplicationProblems(level: number): Promise<MultiplicationProblem[]> {
    const callId = logApiCallStart(
        'Cached Multiplication Problems',
        'GET',
        'fetchMultiplicationProblems',
        level
    );

    try {
        console.log(`📊 Fetching multiplication problems for level ${level} using cached service`);

        // Use cached service instead of direct API call
        const problems = await cachedApiService.getFilteredProblems('multiplication', level);

        // Convert raw API data to MultiplicationProblem format
        const multiplicationProblems: MultiplicationProblem[] = problems.map((problem: any) => {
            // Convert API format to MultiplicationQuestion format
            const multiplicationQuestion: MultiplicationQuestion = {
                question: problem.question,
                number_0: problem.number_0,
                number_1: problem.number_1,
                operator: problem.operator
            };

            // Use the existing conversion function
            return convertToMultiplicationProblem(multiplicationQuestion);
        });

        // Filter problems for the specific level
        const filteredProblems = filterMultiplicationProblemsForLevel(multiplicationProblems, level);

        console.log(`📊 Converted ${problems.length} raw problems to ${filteredProblems.length} filtered multiplication problems for level ${level}`);

        logApiCallEnd(callId, true);
        return filteredProblems;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching multiplication problems:', errorMessage);
        logApiCallEnd(callId, false, errorMessage);
        throw error;
    }
}

/**
 * Fetches addition problems for a specific level
 */
export async function fetchAdditionProblems(level: number): Promise<AdditionProblem[]> {
    const callId = logApiCallStart(
        'Cached Addition Problems',
        'GET',
        'fetchAdditionProblems',
        level
    );

    try {
        console.log(`📊 Fetching addition problems for level ${level} using cached service`);

        // Use cached service instead of direct API call
        const problems = await cachedApiService.getFilteredProblems('addition', level);

        // Convert raw API data to AdditionProblem format
        const additionProblems: AdditionProblem[] = problems.map((problem: any) => {
            // Convert API format to MathQuestion format first
            const mathQuestion: MathQuestion = {
                question: problem.question,
                number_0: problem.number_0,
                number_1: problem.number_1,
                operator: problem.operator
            };

            // Use the existing conversion function
            return convertToAdditionProblem(mathQuestion);
        });

        // Filter problems for the specific level
        const filteredProblems = filterAdditionProblemsForLevel(additionProblems, level);

        console.log(`📊 Converted ${problems.length} raw problems to ${filteredProblems.length} filtered addition problems for level ${level}`);

        logApiCallEnd(callId, true);
        return filteredProblems;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching addition problems:', errorMessage);
        logApiCallEnd(callId, false, errorMessage);
        throw error;
    }
}

/**
 * Fetches subtraction problems for a specific level
 */
export async function fetchSubtractionProblems(level: number): Promise<SubtractionProblem[]> {
    const callId = logApiCallStart(
        'Cached Subtraction Problems',
        'GET',
        'fetchSubtractionProblems',
        level
    );

    try {
        console.log(`📊 Fetching subtraction problems for level ${level} using cached service`);

        // Use cached service instead of direct API call
        const problems = await cachedApiService.getFilteredProblems('subtraction', level);

        // Convert raw API data to SubtractionProblem format
        const subtractionProblems: SubtractionProblem[] = problems.map((problem: any) => {
            // Convert API format to MathQuestion format first
            const mathQuestion: MathQuestion = {
                question: problem.question,
                number_0: problem.number_0,
                number_1: problem.number_1,
                operator: problem.operator
            };

            // Use the existing conversion function
            return convertToSubtractionProblem(mathQuestion);
        });

        // Filter problems for the specific level
        const filteredProblems = filterSubtractionProblemsForLevel(subtractionProblems, level);

        console.log(`📊 Converted ${problems.length} raw problems to ${filteredProblems.length} filtered subtraction problems for level ${level}`);

        logApiCallEnd(callId, true);
        return filteredProblems;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching subtraction problems:', errorMessage);
        logApiCallEnd(callId, false, errorMessage);
        throw error;
    }
} 