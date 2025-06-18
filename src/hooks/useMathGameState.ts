import { useState, useCallback } from 'react';

/**
 * Shared state management hook for math problem UIs (Division, Addition, Multiplication).
 *
 * @template ProblemType - The type representing a problem (e.g., DivisionProblem)
 * @template AnswerType - The type representing a user answer (e.g., UserAnswer)
 * @param config - Configuration for problem generation, validation, and completion
 */
export function useMathGameState<ProblemType, AnswerType>(config: {
    generateProblem: (level?: number) => ProblemType;
    validateAnswer: (problem: ProblemType, answer: AnswerType) => boolean;
    isProblemComplete: (problem: ProblemType, answers: AnswerType[]) => boolean;
    initialLevel?: number;
}) {
    const {
        generateProblem,
        validateAnswer,
        isProblemComplete,
        initialLevel = 1,
    } = config;

    const [gameState, setGameState] = useState(() => ({
        problem: generateProblem(initialLevel),
        userAnswers: [] as AnswerType[],
        isSubmitted: false,
        isComplete: false,
        currentLevel: initialLevel,
        score: 0,
        isEditable: false,
    }));
    const [isLoading] = useState(false);
    const [fetchError] = useState<Error | null>(null);

    // Generate/load a new problem
    const generateNewProblem = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            problem: generateProblem(prev.currentLevel),
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
            isEditable: false,
        }));
    }, [generateProblem]);

    // Submit an answer for a specific field
    const submitAnswer = useCallback((answer: AnswerType) => {
        setGameState(prev => {
            // Check if this answer already exists (by shallow equality)
            const idx = prev.userAnswers.findIndex(a => JSON.stringify(a) === JSON.stringify(answer));
            const isCorrect = validateAnswer(prev.problem, answer);
            const newAnswer = { ...answer, isCorrect };
            let updatedAnswers;
            if (idx >= 0) {
                updatedAnswers = [...prev.userAnswers];
                updatedAnswers[idx] = newAnswer;
            } else {
                updatedAnswers = [...prev.userAnswers, newAnswer];
            }
            return {
                ...prev,
                userAnswers: updatedAnswers,
            };
        });
    }, [validateAnswer]);

    // Clear an answer for a specific field
    const clearAnswer = useCallback((predicate: (a: AnswerType) => boolean) => {
        setGameState(prev => ({
            ...prev,
            userAnswers: prev.userAnswers.filter(a => !predicate(a)),
        }));
    }, []);

    // Submit the entire problem for validation
    const submitProblem = useCallback(() => {
        setGameState(prev => {
            const validatedAnswers = prev.userAnswers.map(answer => {
                const isCorrect = validateAnswer(prev.problem, answer);
                return { ...answer, isCorrect };
            });
            const complete = isProblemComplete(prev.problem, validatedAnswers);
            return {
                ...prev,
                userAnswers: validatedAnswers,
                isSubmitted: true,
                isComplete: complete,
                score: complete ? prev.score + 10 : prev.score,
            };
        });
    }, [validateAnswer, isProblemComplete]);

    // Move to next problem (for future extension)
    const nextProblem = useCallback(() => {
        generateNewProblem();
    }, [generateNewProblem]);

    // Reset the current problem
    const resetProblem = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, []);

    // Jump to a specific level
    const jumpToLevel = useCallback((level: number) => {
        setGameState(prev => ({
            ...prev,
            currentLevel: level,
            problem: generateProblem(level),
            userAnswers: [],
            isSubmitted: false,
            isComplete: false,
        }));
    }, [generateProblem]);

    // Enable problem editing
    const enableEditing = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            isEditable: true,
        }));
    }, []);

    // Disable problem editing
    const disableEditing = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            isEditable: false,
        }));
    }, []);

    return {
        gameState,
        isLoading,
        fetchError,
        generateNewProblem,
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