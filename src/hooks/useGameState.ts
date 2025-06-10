import { useState, useCallback } from 'react';
import type { GameState, DivisionProblem, UserAnswer } from '../types/game';
import { GAME_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { generateProblem, calculateDivisionSteps } from '../utils/problemGenerator';
import { validateAnswer, isProblemComplete } from '../utils/divisionValidator';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState>({
        currentLevel: 1,
        currentProblem: 1,
        totalProblems: PROBLEMS_PER_LEVEL,
        isComplete: false,
        problem: null,
        userAnswers: [],
        errors: [],
        gameMode: 'practice', // Default to practice mode
    });

    // Generate a new problem for the current level
    const generateNewProblem = useCallback(() => {
        const level = GAME_LEVELS.find(l => l.id === gameState.currentLevel);
        if (!level) return;

        const problem = generateProblem(level);

        setGameState(prev => ({
            ...prev,
            problem,
            userAnswers: [],
            errors: [],
            isComplete: false,
            isSubmitted: false,
        }));

        return problem;
    }, [gameState.currentLevel]);

    // Submit a user answer (without immediate validation)
    const submitAnswer = useCallback((userAnswer: UserAnswer) => {
        if (!gameState.problem) return;

        setGameState(prev => {
            // Remove any existing answer for this exact position
            const filteredAnswers = prev.userAnswers.filter(
                ans => !(ans.stepNumber === userAnswer.stepNumber &&
                    ans.fieldType === userAnswer.fieldType &&
                    ans.fieldPosition === userAnswer.fieldPosition)
            );

            // Add the new answer without validation
            const answerWithoutValidation = { ...userAnswer, isCorrect: false };
            const updatedAnswers = [...filteredAnswers, answerWithoutValidation];

            return {
                ...prev,
                userAnswers: updatedAnswers,
                isSubmitted: false, // Reset submitted state when new answers are added
                isComplete: false,
            };
        });

        return false; // Don't return validation result
    }, [gameState.problem]);

    // Submit the entire problem for validation
    const submitProblem = useCallback(() => {
        if (!gameState.problem) return false;

        setGameState(prev => {
            // Validate all answers
            const validatedAnswers = prev.userAnswers.map(answer => ({
                ...answer,
                isCorrect: validateAnswer(prev.problem!, answer)
            }));

            const problemComplete = isProblemComplete(prev.problem!, validatedAnswers);

            return {
                ...prev,
                userAnswers: validatedAnswers,
                isSubmitted: true,
                isComplete: problemComplete,
                errors: validatedAnswers
                    .filter(ans => !ans.isCorrect)
                    .map(ans => `Incorrect answer for step ${ans.stepNumber} ${ans.fieldType}`)
            };
        });

        return true;
    }, [gameState.problem]);

    // Clear a specific answer (for deletion)
    const clearAnswer = useCallback((stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', fieldPosition: number) => {
        setGameState(prev => {
            const filteredAnswers = prev.userAnswers.filter(
                ans => !(ans.stepNumber === stepNumber &&
                    ans.fieldType === fieldType &&
                    ans.fieldPosition === fieldPosition)
            );

            const problemComplete = prev.problem ? isProblemComplete(prev.problem, filteredAnswers) : false;

            return {
                ...prev,
                userAnswers: filteredAnswers,
                isComplete: problemComplete,
            };
        });
    }, [gameState.problem]);

    // Move to next problem
    const nextProblem = useCallback(() => {
        setGameState(prev => {
            const isLastProblem = prev.currentProblem >= prev.totalProblems;
            const isLastLevel = prev.currentLevel >= GAME_LEVELS.length;

            if (isLastProblem && isLastLevel) {
                // Game complete
                return {
                    ...prev,
                    isComplete: true,
                };
            } else if (isLastProblem) {
                // Move to next level
                return {
                    ...prev,
                    currentLevel: prev.currentLevel + 1,
                    currentProblem: 1,
                    problem: null,
                    userAnswers: [],
                    errors: [],
                    isComplete: false,
                };
            } else {
                // Move to next problem in current level
                return {
                    ...prev,
                    currentProblem: prev.currentProblem + 1,
                    problem: null,
                    userAnswers: [],
                    errors: [],
                    isComplete: false,
                };
            }
        });
    }, []);

    // Jump to specific level
    const jumpToLevel = useCallback((levelId: number) => {
        const level = GAME_LEVELS.find(l => l.id === levelId);
        if (!level) return;

        setGameState(prev => ({
            ...prev,
            currentLevel: levelId,
            currentProblem: 1,
            problem: null,
            userAnswers: [],
            errors: [],
            isComplete: false,
        }));
    }, []);

    // Reset current problem
    const resetProblem = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            userAnswers: [],
            errors: [],
            isComplete: false,
        }));
    }, []);

    // Initialize with first problem if none exists
    const initializeGame = useCallback(() => {
        if (!gameState.problem) {
            generateNewProblem();
        }
    }, [gameState.problem, generateNewProblem]);

    // Update problem dynamically (for editable mode)
    const updateProblem = useCallback((dividend: number, divisor: number) => {
        if (divisor === 0) return; // Prevent division by zero

        try {
            const quotient = Math.floor(dividend / divisor);
            const remainder = dividend % divisor;
            const steps = calculateDivisionSteps(dividend, divisor);

            const newProblem: DivisionProblem = {
                dividend,
                divisor,
                quotient,
                remainder,
                steps,
                isEditable: gameState.problem?.isEditable || false
            };

            setGameState(prev => ({
                ...prev,
                problem: newProblem,
                userAnswers: [], // Clear all user answers when problem changes
                errors: [],
                isComplete: false,
                isSubmitted: false,
            }));
        } catch (error) {
            console.error('Error updating problem:', error);
        }
    }, [gameState.problem?.isEditable]);

    // Enable editing mode
    const enableEditing = useCallback(() => {
        if (gameState.problem) {
            setGameState(prev => ({
                ...prev,
                problem: {
                    ...prev.problem!,
                    isEditable: true
                }
            }));
        }
    }, [gameState.problem]);

    // Disable editing mode  
    const disableEditing = useCallback(() => {
        if (gameState.problem) {
            setGameState(prev => ({
                ...prev,
                problem: {
                    ...prev.problem!,
                    isEditable: false
                }
            }));
        }
    }, [gameState.problem]);

    // Switch game mode
    const switchGameMode = useCallback((mode: 'practice' | 'rescue') => {
        setGameState(prev => ({
            ...prev,
            gameMode: mode,
            // Reset some state when switching modes
            isSubmitted: false,
            isComplete: false,
            userAnswers: [],
            errors: [],
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
        resetProblem,
        initializeGame,
        currentLevel: GAME_LEVELS.find(l => l.id === gameState.currentLevel),
        updateProblem,
        enableEditing,
        disableEditing,
        switchGameMode,
    };
} 