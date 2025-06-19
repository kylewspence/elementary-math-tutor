import { useState, useCallback, useEffect } from 'react';
import type { MultiplicationGameState, MultiplicationProblem, MultiplicationUserAnswer, MultiplicationDifficulty } from '../types/multiplication';
import { MULTIPLICATION_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { generateMultiplicationProblem, createSpecificMultiplicationProblem } from '../utils/multiplicationProblemGenerator';
import { validateMultiplicationAnswer, isMultiplicationProblemComplete } from '../utils/multiplicationValidator';
import { fetchMultiplicationProblems } from '../utils/apiService';
import { FEATURES } from '../utils/config';

// Minimum number of problems needed per level before falling back to local generation
const MIN_PROBLEMS_PER_LEVEL = 8;

/**
 * Maps game level ID to multiplication difficulty
 */
function mapLevelToDifficulty(levelId: number): MultiplicationDifficulty {
    // Map level IDs to difficulty
    if (levelId <= 2) return 'easy';
    if (levelId <= 5) return 'medium';
    if (levelId <= 8) return 'hard';
    return 'expert';
}

/**
 * Generates a multiplication problem specifically for the given level ID
 */
function generateLevelSpecificMultiplicationProblem(levelId: number): MultiplicationProblem {
    // Map the level ID to a difficulty
    const difficulty = mapLevelToDifficulty(levelId);

    // Generate the problem with the appropriate difficulty
    return generateMultiplicationProblem(difficulty);
}

/**
 * Custom hook to manage the multiplication game state
 */
export function useMultiplicationGameState() {
    // Complete game state
    const [gameState, setGameState] = useState<MultiplicationGameState>({
        currentLevel: 1,
        completedLevels: [],
        availableLevels: [1],
        currentProblemIndex: 0,
        levelProblems: [],
        problem: null,
        userAnswers: [],
        isSubmitted: false,
        isComplete: false,
        score: 0,
        gameMode: 'multiplication',
    });

    // Loading state for API calls
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Load problems for a specific level
    const loadProblemsForLevel = useCallback(async (levelId: number) => {
        setIsLoading(true);
        setFetchError(null);

        try {
            let problems: MultiplicationProblem[] = [];

            // Only fetch from API if feature is enabled
            if (FEATURES.USE_API_PROBLEMS) {
                // Fetch from API first
                const apiProblems = await fetchMultiplicationProblems(levelId);
                problems = [...apiProblems];
            }

            // If we don't have enough from the API, supplement with local generation
            const MIN_PROBLEMS_FROM_API = 8;
            if (problems.length < MIN_PROBLEMS_FROM_API) {
                const localProblemsNeeded = PROBLEMS_PER_LEVEL - problems.length;
                const localProblems = Array.from({ length: localProblemsNeeded },
                    () => generateLevelSpecificMultiplicationProblem(levelId));

                problems = [...problems, ...localProblems];
            }

            // Limit to 10 problems and shuffle
            problems = problems.slice(0, PROBLEMS_PER_LEVEL);
            problems = shuffleArray(problems);

            setGameState(prev => ({
                ...prev,
                levelProblems: problems,
                currentProblemIndex: 0,
                problem: problems.length > 0 ? problems[0] : null,
                userAnswers: [],
                isSubmitted: false,
            }));
        } catch (error) {
            console.error('Error loading multiplication problems:', error);
            setFetchError('Failed to load problems. Please try again.');

            // Fallback to locally generated problems
            const fallbackProblems = Array.from({ length: PROBLEMS_PER_LEVEL },
                () => generateLevelSpecificMultiplicationProblem(levelId));

            setGameState(prev => ({
                ...prev,
                levelProblems: fallbackProblems,
                currentProblemIndex: 0,
                problem: fallbackProblems.length > 0 ? fallbackProblems[0] : null,
                userAnswers: [],
                isSubmitted: false,
            }));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize game state
    const initializeGame = useCallback(async () => {
        // Load initial level
        await loadProblemsForLevel(1);

        // Initialize available levels based on feature flags
        let initialLevels = [1];
        if (FEATURES.ALLOW_LEVEL_SKIPPING) {
            initialLevels = MULTIPLICATION_LEVELS.map(l => l.id);
        }

        setGameState(prev => ({
            ...prev,
            availableLevels: initialLevels,
            completedLevels: [],
            currentLevel: 1,
            score: 0,
        }));
    }, [loadProblemsForLevel]);

    // Jump to a specific level
    const jumpToLevel = useCallback((levelId: number) => {
        // Check if the level exists
        if (!MULTIPLICATION_LEVELS.some(l => l.id === levelId)) {
            return;
        }

        // Reset problem state and load new level
        setGameState(prev => ({
            ...prev,
            currentLevel: levelId,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));

        // Load problems for the selected level
        loadProblemsForLevel(levelId);
    }, [loadProblemsForLevel]);

    // Restore exact game state without regenerating problems
    const restoreGameState = useCallback((levelId: number, problemIndex: number, problems: MultiplicationProblem[]) => {
        // Check if the level exists
        if (!MULTIPLICATION_LEVELS.some(l => l.id === levelId)) {
            return;
        }

        // Ensure problemIndex is within bounds
        const safeIndex = Math.max(0, Math.min(problemIndex, problems.length - 1));
        const currentProblem = problems[safeIndex] || null;

        // Restore exact state
        setGameState(prev => ({
            ...prev,
            currentLevel: levelId,
            currentProblemIndex: safeIndex,
            levelProblems: problems,
            problem: currentProblem,
            userAnswers: [], // Always clear user answers when restoring
            isSubmitted: false,
            isComplete: false,
        }));
    }, []);

    // Generate a new problem
    const generateNewProblem = useCallback(() => {
        setGameState(prev => {
            // If we have problems available for this level, use the next one
            if (prev.levelProblems.length > 0 && prev.currentProblemIndex < prev.levelProblems.length) {
                const nextProblem = prev.levelProblems[prev.currentProblemIndex];
                return {
                    ...prev,
                    problem: nextProblem,
                    userAnswers: [],
                    isSubmitted: false,
                    isComplete: false,
                };
            }

            // If we've run out of problems, generate a new one
            const newProblem = generateLevelSpecificMultiplicationProblem(prev.currentLevel);
            return {
                ...prev,
                problem: newProblem,
                userAnswers: [],
                isSubmitted: false,
                isComplete: false,
            };
        });
    }, []);

    // Update current problem (for editing)
    const updateProblem = useCallback((multiplicand: number, multiplier: number) => {
        if (multiplicand <= 0 || multiplier <= 0) {
            // Ensure both numbers are positive
            return;
        }

        // Get the appropriate difficulty for the current level
        const difficulty = mapLevelToDifficulty(gameState.currentLevel);

        // Generate new problem with the specified numbers
        const updatedProblem = createSpecificMultiplicationProblem(multiplicand, multiplier, difficulty);

        setGameState(prev => ({
            ...prev,
            problem: updatedProblem,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, [gameState.currentLevel]);

    // Submit an answer for a specific field
    const submitAnswer = (
        value: number,
        fieldType: 'product' | 'partial' | 'carry',
        position: number,
        partialIndex?: number
    ) => {
        if (!gameState.problem) return;

        // Create a copy of the current answers
        const updatedAnswers = [...gameState.userAnswers];

        // Check if this answer already exists
        const existingIndex = updatedAnswers.findIndex(
            a => a.fieldType === fieldType &&
                a.fieldPosition === position &&
                a.partialIndex === partialIndex
        );

        // Calculate the correct answer based on field type
        let isCorrect = false;

        if (fieldType === 'product') {
            // For product fields, check against the product digits
            const productDigits = gameState.problem.product.toString().split('').map(Number).reverse();
            isCorrect = value === productDigits[position];
        }
        else if (fieldType === 'partial' && partialIndex !== undefined) {
            // For partial product fields, check against the partial product digits
            const partial = gameState.problem.partialProducts[partialIndex];
            const partialDigits = partial.value.toString().split('').map(Number).reverse();
            isCorrect = value === partialDigits[position];
        }
        else if (fieldType === 'carry') {
            // For carry fields, calculate the correct carry value
            const multiplicandStr = gameState.problem.multiplicand.toString();
            if (position === multiplicandStr.length) {
                // Leftmost carry
                const leftmostDigit = parseInt(multiplicandStr[0], 10);
                const product = leftmostDigit * gameState.problem.multiplier;
                const correctCarry = Math.floor(product / 10);
                isCorrect = value === correctCarry;
            } else if (position < multiplicandStr.length) {
                // Other carries
                const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - position], 10);
                const product = digit * gameState.problem.multiplier;
                const correctCarry = Math.floor(product / 10); // The carry is the tens digit
                isCorrect = value === correctCarry;
            } else {
                // If position is out of range, any value is incorrect
                isCorrect = false;
            }
        }

        // Create or update the answer
        const answer: MultiplicationUserAnswer = {
            fieldType,
            fieldPosition: position,
            partialIndex,
            value,
            isCorrect,
            timestamp: new Date(),
        };

        if (existingIndex >= 0) {
            updatedAnswers[existingIndex] = answer;
        } else {
            updatedAnswers.push(answer);
        }

        // Update the game state
        setGameState(prev => ({
            ...prev,
            userAnswers: updatedAnswers,
        }));
    };

    // Clear an answer for a specific field
    const clearAnswer = useCallback((fieldType: 'product' | 'partial' | 'carry', fieldPosition: number, partialIndex?: number) => {
        setGameState(prev => {
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.fieldType === fieldType &&
                    a.fieldPosition === fieldPosition &&
                    a.partialIndex === partialIndex)
            );

            return {
                ...prev,
                userAnswers: filteredAnswers,
            };
        });
    }, []);

    // Submit the entire problem for validation
    const submitProblem = useCallback(() => {
        setGameState(prev => {
            if (!prev.problem) return prev;

            // Validate each answer
            const validatedAnswers = prev.userAnswers.map(answer => {
                const isCorrect = validateMultiplicationAnswer(prev.problem!, answer);
                return { ...answer, isCorrect };
            });

            // Check if the problem is complete and all answers are correct
            const complete = isMultiplicationProblemComplete(prev.problem, validatedAnswers);

            // If complete and not previously submitted, update score and completed levels
            let updatedScore = prev.score;
            const completedLevels = [...prev.completedLevels];
            const availableLevels = [...prev.availableLevels];

            if (complete && !prev.isSubmitted) {
                updatedScore += 10; // Award points for completion

                // Mark level as completed if not already
                if (!completedLevels.includes(prev.currentLevel)) {
                    completedLevels.push(prev.currentLevel);
                }

                // Unlock next level if appropriate
                const nextLevel = prev.currentLevel + 1;
                if (nextLevel <= MULTIPLICATION_LEVELS.length && !availableLevels.includes(nextLevel)) {
                    availableLevels.push(nextLevel);
                }
            }

            return {
                ...prev,
                userAnswers: validatedAnswers,
                isSubmitted: true,
                isComplete: complete,
                score: updatedScore,
                completedLevels,
                availableLevels,
            };
        });
    }, []);

    // Move to next problem
    const nextProblem = useCallback(() => {
        setGameState(prev => {
            // If we have more problems in this level, move to the next one
            if (prev.currentProblemIndex < prev.levelProblems.length - 1) {
                const nextIndex = prev.currentProblemIndex + 1;
                return {
                    ...prev,
                    currentProblemIndex: nextIndex,
                    problem: prev.levelProblems[nextIndex],
                    userAnswers: [],
                    isSubmitted: false,
                    isComplete: false,
                };
            }

            // If we've finished the last problem, advance to the next level if available
            const nextLevelId = prev.currentLevel + 1;
            if (prev.availableLevels.includes(nextLevelId)) {
                // Advance to next level and load its problems
                // Note: This will trigger async problem loading, but we set level immediately
                // The loadProblemsForLevel call will update problems when async operation completes
                setTimeout(() => loadProblemsForLevel(nextLevelId), 0);

                return {
                    ...prev,
                    currentLevel: nextLevelId,
                    currentProblemIndex: 0,
                    problem: null, // Will be set by loadProblemsForLevel
                    userAnswers: [],
                    isSubmitted: false,
                    isComplete: false,
                };
            }

            // If no next level available, generate a new problem for current level
            const newProblem = generateLevelSpecificMultiplicationProblem(prev.currentLevel);
            return {
                ...prev,
                problem: newProblem,
                userAnswers: [],
                isSubmitted: false,
                isComplete: false,
            };
        });
    }, [loadProblemsForLevel]);

    // Enable problem editing
    const enableEditing = useCallback(() => {
        setGameState(prev => {
            if (!prev.problem) return prev;
            return {
                ...prev,
                problem: { ...prev.problem, isEditable: true },
            };
        });
    }, []);

    // Disable problem editing
    const disableEditing = useCallback(() => {
        setGameState(prev => {
            if (!prev.problem) return prev;
            return {
                ...prev,
                problem: { ...prev.problem, isEditable: false },
            };
        });
    }, []);

    // Initialize the game on first load
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    return {
        gameState,
        isLoading,
        fetchError,
        loadProblemsForLevel,
        initializeGame,
        generateNewProblem,
        updateProblem,
        submitAnswer,
        clearAnswer,
        submitProblem,
        nextProblem,
        jumpToLevel,
        restoreGameState,
        enableEditing,
        disableEditing,
    };
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
} 