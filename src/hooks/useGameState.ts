import { useState, useCallback } from 'react';
import type { GameState, DivisionProblem, UserAnswer } from '../types/game';
import { GAME_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { generateProblem } from '../utils/problemGenerator';
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
        }));

        return problem;
    }, [gameState.currentLevel]);

    // Submit a user answer
    const submitAnswer = useCallback((userAnswer: UserAnswer) => {
        if (!gameState.problem) return;

        const isCorrect = validateAnswer(gameState.problem, userAnswer);
        const answerWithValidation = { ...userAnswer, isCorrect };

        setGameState(prev => {
            // Remove any existing answer for this exact position
            const filteredAnswers = prev.userAnswers.filter(
                ans => !(ans.stepNumber === userAnswer.stepNumber &&
                    ans.fieldType === userAnswer.fieldType &&
                    ans.fieldPosition === userAnswer.fieldPosition)
            );

            const updatedAnswers = [...filteredAnswers, answerWithValidation];
            const problemComplete = isProblemComplete(prev.problem!, updatedAnswers);

            return {
                ...prev,
                userAnswers: updatedAnswers,
                isComplete: problemComplete,
                errors: isCorrect ? prev.errors : [...prev.errors, `Incorrect answer for step ${userAnswer.stepNumber}`],
            };
        });

        return isCorrect;
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

    return {
        gameState,
        generateNewProblem,
        submitAnswer,
        clearAnswer,
        nextProblem,
        jumpToLevel,
        resetProblem,
        initializeGame,
        currentLevel: GAME_LEVELS.find(l => l.id === gameState.currentLevel),
    };
} 