import type { DivisionProblem } from '../types/game';
import { calculateDivisionSteps } from './problemGenerator';
import { API_CONFIG } from './config';

interface MathQuestion {
    question: string;
    number_0: string;
    number_1: string;
    operator: string;
}

interface ApiResponse {
    tag: string;
    public: {
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
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            device_id: API_CONFIG.DEVICE_ID,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Converts an API question to a division problem format
 */
export function convertToDivisionProblem(question: MathQuestion): DivisionProblem {
    // For division, number_0 is the dividend and number_1 is the divisor
    const dividend = parseInt(question.number_0);
    const divisor = parseInt(question.number_1);

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
        isEditable: false
    };
}

/**
 * Evaluates the difficulty of a division problem
 * @returns A difficulty score from 1-10
 */
function evaluateProblemDifficulty(problem: DivisionProblem): number {
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
 * Generates a unique identifier for a division problem to detect duplicates
 */
function getProblemKey(problem: DivisionProblem): string {
    return `${problem.dividend}_${problem.divisor}`;
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
 * Filters problems to ensure they match the expected difficulty level and removes duplicates
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

    // Filter problems
    for (const problem of problems) {
        const difficulty = evaluateProblemDifficulty(problem);
        const key = getProblemKey(problem);

        // Check each filter condition separately
        if (difficulty >= minDifficulty &&
            difficulty <= maxDifficulty &&
            !uniqueProblems.has(key) &&
            meetsLevelRequirements(problem, levelId)) {
            uniqueProblems.set(key, problem);
        }
    }

    // Return unique problems that meet criteria
    return Array.from(uniqueProblems.values());
}

/**
 * Fetches division problems of a specific level
 * @param level 0=easy, 1=medium, 2=hard
 */
export async function fetchDivisionProblems(level: number = 0): Promise<DivisionProblem[]> {
    try {
        const response = await fetchMathProblems();

        // Get all division problems from all levels - we'll filter by difficulty later
        const allDivisionProblems: DivisionProblem[] = [];

        // Get problems from all division levels in the API response
        for (let i = 0; i <= 2; i++) {
            const key = `division_${i}`;
            const divisionQuestions = response.public[key] || [];
            const problems = divisionQuestions.map(convertToDivisionProblem);
            allDivisionProblems.push(...problems);
        }

        // Filter problems by difficulty level and remove duplicates
        const filteredProblems = filterProblemsForLevel(allDivisionProblems, level);

        return filteredProblems;
    } catch {
        // Return empty array on error
        return [];
    }
} 