import { useState, useCallback } from 'react';
import type { AdditionProblem, AdditionUserAnswer, AdditionGameState, AdditionStep } from '../types/addition';
import { ADDITION_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { generateAdditionProblem } from '../utils/additionGenerator';
import { validateAdditionAnswer, isAdditionProblemComplete } from '../utils/additionValidator';
import { FEATURES } from '../utils/config';

/**
 * Generates a problem specifically for the given level ID
 */
function generateLevelSpecificAdditionProblem(levelId: number): AdditionProblem {
    const level = ADDITION_LEVELS.find(l => l.id === levelId);
    if (!level) {
        throw new Error(`Addition level ${levelId} not found`);
    }

    // Generate the problem with full computation using the level object
    const problem = generateAdditionProblem(level);

    return problem;
}

/**
 * Custom hook to manage the addition game state
 */
export function useAdditionGameState() {
    // Complete game state
    const [gameState, setGameState] = useState<AdditionGameState>({
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
        gameMode: 'addition',
    });

    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Load problems for a specific level
    const loadProblemsForLevel = useCallback(async (levelId: number) => {
        setIsLoading(true);
        setFetchError(null);

        try {
            // Generate problems for this level
            const problems: AdditionProblem[] = [];
            for (let i = 0; i < PROBLEMS_PER_LEVEL; i++) {
                problems.push(generateLevelSpecificAdditionProblem(levelId));
            }

            // Shuffle the problems
            const shuffledProblems = shuffleArray(problems);

            setGameState(prev => ({
                ...prev,
                levelProblems: shuffledProblems,
                currentProblemIndex: 0,
                problem: shuffledProblems.length > 0 ? shuffledProblems[0] : null,
            }));
        } catch {
            setFetchError('Failed to generate problems. Please try again.');

            // Generate a fallback problem
            const fallbackProblem = generateLevelSpecificAdditionProblem(levelId);

            setGameState(prev => ({
                ...prev,
                levelProblems: [fallbackProblem],
                currentProblemIndex: 0,
                problem: fallbackProblem,
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
            initialLevels = ADDITION_LEVELS.map(l => l.id);
        }

        setGameState(prev => ({
            ...prev,
            availableLevels: initialLevels,
            completedLevels: [],
            currentLevel: 1,
            score: 0,
            gameMode: 'addition',
        }));
    }, [loadProblemsForLevel]);

    // Jump to a specific level
    const jumpToLevel = useCallback((levelId: number) => {
        // Check if the level exists
        if (!ADDITION_LEVELS.some(l => l.id === levelId)) {
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
            const newProblem = generateLevelSpecificAdditionProblem(prev.currentLevel);
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
    const updateProblem = useCallback((addend1: number, addend2: number) => {
        if (addend1 <= 0 || addend2 <= 0) {
            // Ensure positive numbers
            return;
        }

        // Find the current level object
        const currentLevel = ADDITION_LEVELS.find(l => l.id === gameState.currentLevel);
        if (!currentLevel) return;

        // Create a custom problem using the specific addends
        const updatedProblem = generateAdditionProblem(currentLevel, addend1, addend2);

        setGameState(prev => ({
            ...prev,
            problem: updatedProblem,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, [gameState.currentLevel]);

    // Submit an answer for a specific field
    const submitAnswer = useCallback((answer: AdditionUserAnswer) => {
        setGameState(prev => {
            // First remove any existing answer for the same field
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.columnPosition === answer.columnPosition &&
                    a.fieldType === answer.fieldType)
            );

            // Add the new answer
            return {
                ...prev,
                userAnswers: [...filteredAnswers, answer],
            };
        });
    }, []);

    // Clear an answer for a specific field
    const clearAnswer = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
        setGameState(prev => {
            const filteredAnswers = prev.userAnswers.filter(a =>
                !(a.columnPosition === columnPosition &&
                    a.fieldType === fieldType)
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
                const isCorrect = validateAdditionAnswer(prev.problem!, answer);
                return { ...answer, isCorrect };
            });

            // Check if the problem is complete and all answers are correct
            const complete = isAdditionProblemComplete(prev.problem, validatedAnswers);

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
                if (nextLevelId <= ADDITION_LEVELS.length && !availableLevels.includes(nextLevelId)) {
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

            // Otherwise, generate a new problem
            const newProblem = generateLevelSpecificAdditionProblem(prev.currentLevel);
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
        generateNewProblem,
        submitAnswer,
        submitProblem,
        clearAnswer,
        nextProblem,
        jumpToLevel,
        resetProblem,
        initializeGame,
        updateProblem,
        enableEditing,
        disableEditing,
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

// Helper function to calculate addition steps
function calculateAdditionSteps(addend1: number, addend2: number): AdditionStep[] {
    const addend1Str = addend1.toString();
    const addend2Str = addend2.toString();

    // Determine the maximum number of digits
    const maxLength = Math.max(addend1Str.length, addend2Str.length);

    let carryValue = 0; // Initialize carry
    const steps: AdditionStep[] = [];

    // Process each column from right to left (ones, tens, hundreds, etc.)
    for (let i = 0; i < maxLength; i++) {
        // Get digits from right to left (or 0 if position doesn't exist)
        const digit1 = parseInt(addend1Str[addend1Str.length - 1 - i] || '0');
        const digit2 = parseInt(addend2Str[addend2Str.length - 1 - i] || '0');

        // Calculate column sum including any carry from previous column
        const columnSum = digit1 + digit2 + carryValue;

        // Determine if we need to carry to the next column
        const nextCarry = columnSum >= 10 ? 1 : 0;

        // The digit that goes in the sum (ones digit of columnSum)
        const sumDigit = columnSum % 10;

        // Create the step
        const step = {
            stepNumber: i,
            columnPosition: i,
            digit1,
            digit2,
            sum: sumDigit,
            carry: nextCarry,
            carryReceived: carryValue
        };

        steps.push(step);

        // Update carry for next iteration
        carryValue = nextCarry;
    }

    // If there's a final carry, add it as the most significant digit
    if (carryValue > 0) {
        steps.push({
            stepNumber: maxLength,
            columnPosition: maxLength,
            digit1: 0,
            digit2: 0,
            sum: carryValue,
            carry: 0,
            carryReceived: 0
        });
    }

    return steps;
} 