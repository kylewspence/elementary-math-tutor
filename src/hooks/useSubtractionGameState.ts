import { useState, useCallback } from 'react';
import type { SubtractionProblem, SubtractionUserAnswer, SubtractionGameState, SubtractionStep } from '../types/subtraction';
import { SUBTRACTION_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { generateSubtractionProblem } from '../utils/subtractionGenerator';
import { validateSubtractionAnswer, isSubtractionProblemComplete } from '../utils/subtractionValidator';
import { fetchSubtractionProblems } from '../utils/apiService';
import { FEATURES } from '../utils/config';

// Minimum number of problems needed per level before falling back to local generation
const MIN_PROBLEMS_PER_LEVEL = 8;

/**
 * Generates a problem specifically for the given level ID
 */
function generateLevelSpecificSubtractionProblem(levelId: number): SubtractionProblem {
    const level = SUBTRACTION_LEVELS.find(l => l.id === levelId);
    if (!level) {
        throw new Error(`Subtraction level ${levelId} not found`);
    }

    // Generate the problem with full computation using the level object
    const problem = generateSubtractionProblem(level);

    return problem;
}

/**
 * Custom hook to manage the subtraction game state
 */
export function useSubtractionGameState() {
    // Complete game state
    const [gameState, setGameState] = useState<SubtractionGameState>({
        currentLevel: 1,
        completedLevels: [],
        availableLevels: [1],
        currentProblemIndex: 0,
        levelProblems: [],
        problem: null,
        userAnswers: [],
        currentFocus: { columnPosition: 0, fieldType: 'difference' },
        isSubmitted: false,
        isComplete: false,
        score: 0,
        gameMode: 'subtraction',
    });

    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Load problems for a specific level
    const loadProblemsForLevel = useCallback(async (levelId: number) => {
        setIsLoading(true);
        setFetchError(null);

        try {
            let problems: SubtractionProblem[] = [];

            // Only fetch from API if feature is enabled
            if (FEATURES.USE_API_PROBLEMS) {
                // Fetch from API first
                const apiProblems = await fetchSubtractionProblems(levelId);
                problems = [...apiProblems];
            }

            // If we don't have enough from the API, supplement with local generation
            const MIN_PROBLEMS_FROM_API = 8;
            if (problems.length < MIN_PROBLEMS_FROM_API) {
                const localProblemsNeeded = PROBLEMS_PER_LEVEL - problems.length;
                const localProblems = Array.from({ length: localProblemsNeeded },
                    () => generateLevelSpecificSubtractionProblem(levelId));

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
            console.error('Error loading subtraction problems:', error);
            setFetchError('Failed to load problems. Please try again.');

            // Fallback to locally generated problems
            const fallbackProblems = Array.from({ length: PROBLEMS_PER_LEVEL },
                () => generateLevelSpecificSubtractionProblem(levelId));

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
            initialLevels = SUBTRACTION_LEVELS.map(l => l.id);
        }

        setGameState(prev => ({
            ...prev,
            availableLevels: initialLevels,
            completedLevels: [],
            currentLevel: 1,
            score: 0,
            gameMode: 'subtraction',
        }));
    }, [loadProblemsForLevel]);

    // Jump to a specific level
    const jumpToLevel = useCallback((levelId: number) => {
        // Check if the level exists
        if (!SUBTRACTION_LEVELS.some(l => l.id === levelId)) {
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
    const restoreGameState = useCallback((levelId: number, problemIndex: number, problems: SubtractionProblem[]) => {
        // Check if the level exists
        if (!SUBTRACTION_LEVELS.some(l => l.id === levelId)) {
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
            const newProblem = generateLevelSpecificSubtractionProblem(prev.currentLevel);
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
    const updateProblem = useCallback((minuend: number, subtrahend: number) => {
        if (minuend <= 0 || subtrahend <= 0 || subtrahend >= minuend) {
            // Ensure positive numbers and valid subtraction
            return;
        }

        // Find the current level object
        const currentLevel = SUBTRACTION_LEVELS.find(l => l.id === gameState.currentLevel);
        if (!currentLevel) return;

        // Create a custom problem using the specific numbers
        const updatedProblem = generateSubtractionProblem(currentLevel, minuend, subtrahend);

        setGameState(prev => ({
            ...prev,
            problem: updatedProblem,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, [gameState.currentLevel]);

    // Submit an answer for a specific field
    const submitAnswer = useCallback((answer: SubtractionUserAnswer) => {
        setGameState(prev => {
            // First remove any existing answer for the same field
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.columnPosition === answer.columnPosition &&
                    a.fieldType === answer.fieldType)
            );

            // Add the new answer
            const updatedAnswers = [...filteredAnswers, answer];

            // If problem was already submitted, re-validate all answers and check completion
            if (prev.isSubmitted && prev.problem) {
                const validatedAnswers = updatedAnswers.map(ans => {
                    const isCorrect = validateSubtractionAnswer(prev.problem!, ans);
                    return { ...ans, isCorrect };
                });

                const complete = isSubtractionProblemComplete(prev.problem, validatedAnswers);

                return {
                    ...prev,
                    userAnswers: validatedAnswers,
                    isComplete: complete,
                };
            }

            // If not yet submitted, just update the answers
            return {
                ...prev,
                userAnswers: updatedAnswers,
            };
        });
    }, []);

    // Clear an answer for a specific field
    const clearAnswer = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow' | 'adjusted') => {
        setGameState(prev => {
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.columnPosition === columnPosition &&
                    a.fieldType === fieldType)
            );

            // If problem was already submitted, re-validate remaining answers and check completion
            if (prev.isSubmitted && prev.problem) {
                const validatedAnswers = filteredAnswers.map(ans => {
                    const isCorrect = validateSubtractionAnswer(prev.problem!, ans);
                    return { ...ans, isCorrect };
                });

                const complete = isSubtractionProblemComplete(prev.problem, validatedAnswers);

                return {
                    ...prev,
                    userAnswers: validatedAnswers,
                    isComplete: complete,
                };
            }

            // If not yet submitted, just update the answers
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
                const isCorrect = validateSubtractionAnswer(prev.problem!, answer);
                return { ...answer, isCorrect };
            });

            // Check if the problem is complete and all answers are correct
            const complete = isSubtractionProblemComplete(prev.problem, validatedAnswers);

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

                // Unlock next level if not already available
                const nextLevelId = prev.currentLevel + 1;
                if (nextLevelId <= SUBTRACTION_LEVELS.length && !availableLevels.includes(nextLevelId)) {
                    availableLevels.push(nextLevelId);
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

    // Move to the next problem
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
            const newProblem = generateLevelSpecificSubtractionProblem(prev.currentLevel);
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

    // Update current focus
    const updateFocus = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow' | 'adjusted') => {
        setGameState(prev => ({
            ...prev,
            currentFocus: { columnPosition, fieldType },
        }));
    }, []);

    return {
        gameState,
        generateNewProblem,
        submitAnswer,
        submitProblem,
        clearAnswer,
        nextProblem,
        jumpToLevel,
        restoreGameState,
        initializeGame,
        updateProblem,
        enableEditing,
        disableEditing,
        updateFocus,
        isLoading,
        fetchError,
        loadProblemsForLevel,
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

// Helper function to calculate subtraction steps
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateSubtractionSteps(minuend: number, subtrahend: number): SubtractionStep[] {
    const minuendStr = minuend.toString();
    const subtrahendStr = subtrahend.toString();

    // Determine the maximum number of digits
    const maxLength = Math.max(minuendStr.length, subtrahendStr.length);

    let borrowValue = 0; // Initialize borrow tracking
    const steps: SubtractionStep[] = [];

    // Process each column from right to left (ones, tens, hundreds, etc.)
    for (let i = 0; i < maxLength; i++) {
        const columnPosition = i;

        // Get digits from right to left
        const minuendDigit = i < minuendStr.length
            ? parseInt(minuendStr[minuendStr.length - 1 - i])
            : 0;
        const subtrahendDigit = i < subtrahendStr.length
            ? parseInt(subtrahendStr[subtrahendStr.length - 1 - i])
            : 0;

        // Apply any borrow from the previous step
        let adjustedMinuend = minuendDigit - borrowValue;
        let needsBorrow = false;
        let borrowed = 0;

        // Check if we need to borrow
        if (adjustedMinuend < subtrahendDigit) {
            needsBorrow = true;
            borrowed = 1;
            adjustedMinuend += 10;
        }

        // Calculate the difference for this column
        const difference = adjustedMinuend - subtrahendDigit;

        const step: SubtractionStep = {
            stepNumber: i + 1,
            columnPosition,
            minuendDigit,
            subtrahendDigit,
            adjustedMinuend,
            difference,
            borrowed,
            lentTo: borrowValue, // Amount that was lent to previous column
            needsBorrow,
        };

        steps.push(step);

        // Set borrow for next iteration
        borrowValue = borrowed;
    }

    return steps;
} 