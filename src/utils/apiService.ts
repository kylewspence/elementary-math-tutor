import type { DivisionProblem } from '../types/game';
import { calculateDivisionSteps } from './problemGenerator';

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

const API_ENDPOINT = 'https://www.bloshup.com:8181/dev/publicmathget';
const DEVICE_ID = '680810a0737ab55963f6223b'; // This would typically come from device storage or config

/**
 * Fetches math problems from the server
 */
export async function fetchMathProblems(): Promise<ApiResponse> {
    try {
        console.log('🌐 Making API request to:', API_ENDPOINT);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tag: 'publicmath.get',
                deviceid: DEVICE_ID
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 API Response structure:', Object.keys(data.public).filter(key => key.startsWith('division')));
        return data;
    } catch (error) {
        console.error('Error fetching math problems:', error);
        throw error;
    }
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

    // Log this problem for debugging
    console.log(`🔍 Evaluating problem: ${problem.dividend} ÷ ${problem.divisor} = ${problem.quotient} r${problem.remainder} for level ${levelId}`);
    console.log(`   Divisor digits: ${divisorDigits}, Dividend digits: ${dividendDigits}`);

    // Level 2: Single digit divisor, 3-digit dividend or higher
    if (levelId === 2) {
        const result = divisorDigits === 1 && dividendDigits >= 3;
        console.log(`   Level 2 requirement met? ${result}`);
        return result;
    }

    // Level 3: Single digit divisor, 4-digit dividend
    if (levelId === 3) {
        const result = divisorDigits === 1 && dividendDigits >= 4;
        console.log(`   Level 3 requirement met? ${result}`);
        return result;
    }

    // Level 4: Two-digit divisor, 3-digit dividend
    if (levelId === 4) {
        const result = divisorDigits >= 2 && dividendDigits >= 3;
        console.log(`   Level 4 requirement met? ${result}`);
        return result;
    }

    // Level 5+: Two-digit divisor, 4-digit dividend or more complex
    const result = divisorDigits >= 2 && dividendDigits >= 4;
    console.log(`   Level 5+ requirement met? ${result}`);
    return result;
}

/**
 * Filters problems to ensure they match the expected difficulty level and removes duplicates
 */
function filterProblemsForLevel(problems: DivisionProblem[], levelId: number): DivisionProblem[] {
    // Create a map to track unique problems
    const uniqueProblems = new Map<string, DivisionProblem>();

    // Determine expected difficulty range based on level
    let minDifficulty = 1;
    let maxDifficulty = 3;

    if (levelId >= 5) {
        minDifficulty = 7;
        maxDifficulty = 10;
    } else if (levelId >= 3) {
        minDifficulty = 4;
        maxDifficulty = 7;
    }

    // Log breakdown of problem types to help diagnose
    const difficultyBreakdown: { [key: string]: number } = {};
    const digitCombos: { [key: string]: number } = {};

    // Filter problems
    for (const problem of problems) {
        const difficulty = evaluateProblemDifficulty(problem);
        const key = getProblemKey(problem);

        // Track statistics for diagnostics
        difficultyBreakdown[difficulty] = (difficultyBreakdown[difficulty] || 0) + 1;

        const divisorDigits = problem.divisor.toString().length;
        const dividendDigits = problem.dividend.toString().length;
        const digitCombo = `${divisorDigits}d-${dividendDigits}d`;
        digitCombos[digitCombo] = (digitCombos[digitCombo] || 0) + 1;

        // Apply more strict filtering based on level requirements
        if (difficulty >= minDifficulty &&
            difficulty <= maxDifficulty &&
            !uniqueProblems.has(key) &&
            meetsLevelRequirements(problem, levelId)) {
            uniqueProblems.set(key, problem);
        }
    }

    // Log diagnostic information
    console.log('📊 Problem difficulty breakdown:', difficultyBreakdown);
    console.log('📊 Problem digit combinations:', digitCombos);
    console.log(`🔎 Filtered from ${problems.length} to ${uniqueProblems.size} problems for level ${levelId}`);

    // Return unique problems that meet criteria
    return Array.from(uniqueProblems.values());
}

/**
 * Fetches division problems of a specific level
 * @param level 0=easy, 1=medium, 2=hard
 */
export async function fetchDivisionProblems(level: number = 0): Promise<DivisionProblem[]> {
    try {
        console.log(`🌐 Fetching division problems for API level: ${level}`);
        const response = await fetchMathProblems();

        // Get all division problems from all levels - we'll filter by difficulty later
        const allDivisionProblems: DivisionProblem[] = [];

        // Get problems from all division levels in the API response
        for (let i = 0; i <= 2; i++) {
            const key = `division_${i}`;
            const divisionQuestions = response.public[key] || [];
            const problems = divisionQuestions.map(convertToDivisionProblem);
            console.log(`📈 API Level ${i} has ${divisionQuestions.length} problems`);

            // Log a sample problem from each level
            if (divisionQuestions.length > 0) {
                const sample = problems[0];
                console.log(`📊 Sample from API level ${i}: ${sample.dividend} ÷ ${sample.divisor} = ${sample.quotient} r${sample.remainder}`);
            }

            allDivisionProblems.push(...problems);
        }

        // Log the number of problems fetched
        console.log(`✅ Fetched ${allDivisionProblems.length} total division problems from API`);

        // Filter problems by difficulty level and remove duplicates
        const filteredProblems = filterProblemsForLevel(allDivisionProblems, level);
        console.log(`📝 Filtered to ${filteredProblems.length} appropriate problems for level ${level}`);

        // Log some examples of the filtered problems
        if (filteredProblems.length > 0) {
            console.log('📄 Sample filtered problems:');
            filteredProblems.slice(0, Math.min(5, filteredProblems.length)).forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.dividend} ÷ ${p.divisor} = ${p.quotient} r${p.remainder}`);
            });
        }

        return filteredProblems;
    } catch (error) {
        console.error('❌ Error fetching division problems:', error);
        // Return empty array on error
        return [];
    }
} 