
import { useState, useCallback } from 'react';
import type { GameState, DivisionProblem, UserAnswer } from '../types/game';
import { GAME_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { generateProblem } from '../utils/problemGenerator';
import { validateAnswer, isProblemComplete } from '../utils/divisionValidator';
import { fetchDivisionProblems } from '../utils/apiService';
import { FEATURES } from '../utils/config';

// Minimum number of problems needed per level before falling back to local generation
const MIN_PROBLEMS_PER_LEVEL = 8;

/**
 * Generates a problem specifically for the given level ID
 */
function generateLevelSpecificProblem(levelId: number): DivisionProblem {
    const level = GAME_LEVELS.find(l => l.id === levelId);
    if (!level) {
        throw new Error(`Level ${levelId} not found`);
    }

    // Generate the problem with full computation using the level object
    const problem = generateProblem(level);

    return problem;
}

/**
 * Custom hook to manage the game state
 */
export function useGameState() {
    // Complete game state
    const [gameState, setGameState] = useState<GameState>({
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
        gameMode: 'division',
    });

    // Loading state for API calls
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Load problems for a specific level
    const loadProblemsForLevel = useCallback(async (levelId: number) => {
        setIsLoading(true);
        setFetchError(null);

        try {
            let problems: DivisionProblem[] = [];

            // Only fetch from API if feature is enabled
            if (FEATURES.USE_API_PROBLEMS) {
                // Pass the actual level ID to the API service for proper filtering
                // The API service will handle mapping to appropriate API difficulty levels internally
                problems = await fetchDivisionProblems(levelId);
            }

            // If we didn't get enough problems from API, generate locally
            if (problems.length < MIN_PROBLEMS_PER_LEVEL) {
                // Generate enough additional problems
                const neededProblems = PROBLEMS_PER_LEVEL - problems.length;
                for (let i = 0; i < neededProblems; i++) {
                    problems.push(generateLevelSpecificProblem(levelId));
                }
            }

            // Limit to maximum problems per level and shuffle
            problems = problems.slice(0, PROBLEMS_PER_LEVEL);
            problems = shuffleArray(problems);

            setGameState(prev => ({
                ...prev,
                levelProblems: problems,
                currentProblemIndex: 0,
                problem: problems.length > 0 ? problems[0] : null,
            }));

        } catch {
            setFetchError('Failed to load problems. Please try again.');

            // Fallback to locally generated problems
            const fallbackProblems = Array.from({ length: PROBLEMS_PER_LEVEL },
                () => generateLevelSpecificProblem(levelId));

            setGameState(prev => ({
                ...prev,
                levelProblems: fallbackProblems,
                currentProblemIndex: 0,
                problem: fallbackProblems.length > 0 ? fallbackProblems[0] : null,
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
            initialLevels = GAME_LEVELS.map(l => l.id);
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
        if (!GAME_LEVELS.some(l => l.id === levelId)) {
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
            const newProblem = generateLevelSpecificProblem(prev.currentLevel);
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
    const updateProblem = useCallback((dividend: number, divisor: number) => {
        if (dividend < divisor) {
            // Ensure dividend is larger than divisor
            return;
        }

        // Find the current level object
        const currentLevel = GAME_LEVELS.find(l => l.id === gameState.currentLevel);
        if (!currentLevel) return;

        const updatedProblem = generateProblem(currentLevel);
        setGameState(prev => ({
            ...prev,
            problem: updatedProblem,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, [gameState.currentLevel]);

    // Submit an answer for a specific field
    const submitAnswer = useCallback((answer: UserAnswer) => {
        setGameState(prev => {
            // First remove any existing answer for the same field
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.stepNumber === answer.stepNumber &&
                    a.fieldType === answer.fieldType &&
                    a.fieldPosition === answer.fieldPosition)
            );

            // Add the new answer
            return {
                ...prev,
                userAnswers: [...filteredAnswers, answer],
            };
        });
    }, []);

    // Clear an answer for a specific field
    const clearAnswer = useCallback((stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => {
        setGameState(prev => {
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.stepNumber === stepNumber &&
                    a.fieldType === fieldType &&
                    a.fieldPosition === position)
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
                const isCorrect = validateAnswer(prev.problem!, answer);
                return { ...answer, isCorrect };
            });

            // Check if the problem is complete and all answers are correct
            const complete = isProblemComplete(prev.problem, validatedAnswers);

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
                if (nextLevel <= GAME_LEVELS.length && !availableLevels.includes(nextLevel)) {
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
            // Move to next problem index
            const nextIndex = prev.currentProblemIndex + 1;

            // If we have more problems available for this level, load the next one
            if (nextIndex < prev.levelProblems.length) {
                return {
                    ...prev,
                    currentProblemIndex: nextIndex,
                    problem: prev.levelProblems[nextIndex],
                    userAnswers: [],
                    isSubmitted: false,
                    isComplete: false,
                };
            }

            // If we've completed all problems, generate a new one
            const newProblem = generateLevelSpecificProblem(prev.currentLevel);
            return {
                ...prev,
                problem: newProblem,
                userAnswers: [],
                isSubmitted: false,
                isComplete: false,
            };
        });
    }, []);

    // Reset the current problem
    const resetProblem = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, []);

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
        resetProblem,
        jumpToLevel,
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