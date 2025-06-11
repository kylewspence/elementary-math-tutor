import { useState, useCallback, useEffect } from 'react';
import type { GameState, DivisionProblem, UserAnswer } from '../types/game';
import { GAME_LEVELS, PROBLEMS_PER_LEVEL } from '../utils/constants';
import { calculateDivisionSteps, generateProblem } from '../utils/problemGenerator';
import { validateAnswer, isProblemComplete } from '../utils/divisionValidator';
import { fetchDivisionProblems } from '../utils/apiService';

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

    // Initialize variables
    let divisor: number;
    let dividend: number;

    // Generate values based on level-specific requirements
    if (levelId === 2) {
        // Level 2: Single digit divisor (2-9) with 3-digit dividend (100-999)
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9

        // Always generate a 3-digit dividend for Level 2
        // Using a wider range for more challenge
        dividend = Math.floor(Math.random() * 900) + 100; // 100-999

        // Ensure the dividend is at least 3x the divisor for a meaningful problem
        if (dividend < divisor * 3) {
            dividend = divisor * (Math.floor(Math.random() * 20) + 10); // Makes it at least 10x
        }
    } else if (levelId === 3) {
        // Level 3: Single digit divisor with 4-digit dividend
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        dividend = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

        // Ensure meaningful problems
        if (dividend < divisor * 10) {
            dividend = divisor * (Math.floor(Math.random() * 300) + 100);
        }
    } else if (levelId === 4) {
        // Level 4: Two-digit divisor with 3-digit dividend
        divisor = Math.floor(Math.random() * 90) + 10; // 10-99
        dividend = Math.floor(Math.random() * 900) + 100; // 100-999

        // Ensure meaningful problems
        if (dividend < divisor * 2) {
            dividend = divisor * (Math.floor(Math.random() * 10) + 2);
        }
    } else if (levelId >= 5) {
        // Level 5+: Two-digit divisor with 4-digit dividend
        divisor = Math.floor(Math.random() * 90) + 10; // 10-99
        dividend = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

        // Ensure meaningful problems
        if (dividend < divisor * 5) {
            dividend = divisor * (Math.floor(Math.random() * 50) + 10);
        }
    } else {
        // Level 1: Simple problems
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        dividend = Math.floor(Math.random() * 90) + 10; // 10-99
    }

    // Recalculate with the adjusted values
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    const steps = calculateDivisionSteps(dividend, divisor);

    // Log the generated problem
    console.log(`🎲 Generated problem for level ${levelId}: ${dividend} ÷ ${divisor} = ${quotient} r${remainder}`);

    return {
        dividend,
        divisor,
        quotient,
        remainder,
        steps,
        isEditable: false
    };
}

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

    // Store fetched problems by level
    const [problemsByLevel, setProblemsByLevel] = useState<{ [key: number]: DivisionProblem[] }>({});
    // Loading state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Error state
    const [fetchError, setFetchError] = useState<string | null>(null);
    // Track which problems have been used to avoid repetition
    const [usedProblemKeys, setUsedProblemKeys] = useState<Set<string>>(new Set());

    // Fetch problems from the server when component mounts
    useEffect(() => {
        // Load problems for the current level
        loadProblemsForLevel(gameState.currentLevel);
    }, [gameState.currentLevel]);

    // Generate a unique key for a problem to track which ones have been used
    const getProblemKey = (problem: DivisionProblem): string => {
        return `${problem.dividend}_${problem.divisor}`;
    };

    // Load problems for a specific level
    const loadProblemsForLevel = useCallback(async (levelId: number) => {
        // Skip if we already have problems for this level
        if (problemsByLevel[levelId] && problemsByLevel[levelId].length > 0) {
            return;
        }

        setIsLoading(true);
        setFetchError(null);

        try {
            // Map our level IDs (1-based) to API level IDs (0-based)
            // Level 1-2 → API level 0 (easy)
            // Level 3-4 → API level 1 (medium)
            // Level 5+ → API level 2 (hard)
            let apiLevel = 0;
            if (levelId >= 5) {
                apiLevel = 2; // Hard
            } else if (levelId >= 3) {
                apiLevel = 1; // Medium
            }

            const problems = await fetchDivisionProblems(apiLevel);

            // For levels 2 and above, we'll always add some locally generated problems
            // to ensure appropriate difficulty
            if (levelId >= 2) {
                console.log(`🏗️ Level ${levelId}: Always adding some locally generated problems to ensure appropriate difficulty`);

                // Generate some level-specific problems
                const localProblems: DivisionProblem[] = [];
                const localProblemCount = levelId === 2 ? 10 : 5; // More for level 2 which has difficulty issues

                console.log(`🔨 Generating ${localProblemCount} level-specific problems for level ${levelId}`);

                for (let i = 0; i < localProblemCount; i++) {
                    // Use level-specific generation logic
                    const problem = generateLevelSpecificProblem(levelId);

                    // Avoid duplicates
                    const key = getProblemKey(problem);
                    if (!problems.some(p => getProblemKey(p) === key) &&
                        !localProblems.some(p => getProblemKey(p) === key)) {
                        localProblems.push(problem);
                    }
                }

                // Add the generated problems to our collection
                const combinedProblems = [...problems, ...localProblems];
                console.log(`🔄 Combined ${problems.length} API problems with ${localProblems.length} locally generated problems. Total: ${combinedProblems.length}`);

                // Log some examples of the locally generated problems
                if (localProblems.length > 0) {
                    console.log('📄 Sample locally generated problems:');
                    localProblems.slice(0, Math.min(5, localProblems.length)).forEach((p, i) => {
                        console.log(`  ${i + 1}. ${p.dividend} ÷ ${p.divisor} = ${p.quotient} r${p.remainder}`);
                    });
                }

                // Store the problems
                setProblemsByLevel(prev => ({
                    ...prev,
                    [levelId]: combinedProblems
                }));
            } else if (problems.length < MIN_PROBLEMS_PER_LEVEL) {
                // Not enough API problems for level 1, supplement with local generation
                console.log(`⚠️ Not enough API problems for level ${levelId}. Generating additional problems locally.`);

                // Generate additional problems
                const localProblems: DivisionProblem[] = [];
                const neededCount = MIN_PROBLEMS_PER_LEVEL - problems.length;

                console.log(`🔨 Generating ${neededCount} level-specific problems for level ${levelId}`);

                for (let i = 0; i < neededCount; i++) {
                    // Use level-specific generation logic
                    const problem = generateLevelSpecificProblem(levelId);

                    // Avoid duplicates
                    const key = getProblemKey(problem);
                    if (!problems.some(p => getProblemKey(p) === key) &&
                        !localProblems.some(p => getProblemKey(p) === key)) {
                        localProblems.push(problem);
                    }
                }

                // Add the generated problems to our collection
                const combinedProblems = [...problems, ...localProblems];
                console.log(`🔄 Added ${localProblems.length} locally generated problems. Total: ${combinedProblems.length}`);

                // Log some examples of the locally generated problems
                if (localProblems.length > 0) {
                    console.log('📄 Sample locally generated problems:');
                    localProblems.slice(0, Math.min(5, localProblems.length)).forEach((p, i) => {
                        console.log(`  ${i + 1}. ${p.dividend} ÷ ${p.divisor} = ${p.quotient} r${p.remainder}`);
                    });
                }

                // Store the problems
                setProblemsByLevel(prev => ({
                    ...prev,
                    [levelId]: combinedProblems
                }));
            } else {
                // We have enough API problems for level 1
                setProblemsByLevel(prev => ({
                    ...prev,
                    [levelId]: problems
                }));
            }
        } catch (error) {
            console.error('Error loading problems:', error);
            setFetchError('Failed to load problems from server. Using locally generated problems instead.');

            // Fallback to local generation on error
            console.log(`🛠️ Generating local problems for level ${levelId} due to API error`);

            const localProblems: DivisionProblem[] = [];
            for (let i = 0; i < MIN_PROBLEMS_PER_LEVEL; i++) {
                localProblems.push(generateLevelSpecificProblem(levelId));
            }

            console.log(`🔄 Generated ${localProblems.length} local problems as fallback`);

            // Store the locally generated problems
            setProblemsByLevel(prev => ({
                ...prev,
                [levelId]: localProblems
            }));
        } finally {
            setIsLoading(false);
        }
    }, [problemsByLevel]);

    // Generate a new problem for the current level
    const generateNewProblem = useCallback(() => {
        const level = GAME_LEVELS.find(l => l.id === gameState.currentLevel);
        if (!level) return;

        // Get a problem from the API-fetched problems
        const problems = problemsByLevel[gameState.currentLevel] || [];

        if (problems.length === 0) {
            console.log('No problems available for this level. Please try again later.');
            return null;
        }

        // Filter out problems that have already been used in this session
        const availableProblems = problems.filter(p => !usedProblemKeys.has(getProblemKey(p)));

        // If we've used all problems, reset the used tracking
        if (availableProblems.length === 0) {
            console.log('All problems have been used. Resetting problem pool.');
            setUsedProblemKeys(new Set());
            // Use all problems again
            const randomIndex = Math.floor(Math.random() * problems.length);
            const problem = { ...problems[randomIndex] };

            // Mark this problem as used
            setUsedProblemKeys(prev => {
                const newSet = new Set(prev);
                newSet.add(getProblemKey(problem));
                return newSet;
            });

            // Log to verify we're using API problems
            console.log('📡 Using problem from API (reset pool):', {
                dividend: problem.dividend,
                divisor: problem.divisor,
                source: 'API'
            });

            setGameState(prev => ({
                ...prev,
                problem,
                userAnswers: [],
                errors: [],
                isComplete: false,
                isSubmitted: false,
            }));

            return problem;
        }

        // Get a random problem from the unused problems
        const randomIndex = Math.floor(Math.random() * availableProblems.length);
        const problem = { ...availableProblems[randomIndex] };

        // Mark this problem as used
        setUsedProblemKeys(prev => {
            const newSet = new Set(prev);
            newSet.add(getProblemKey(problem));
            return newSet;
        });

        // Log to verify we're using API problems
        console.log('📡 Using problem from API:', {
            dividend: problem.dividend,
            divisor: problem.divisor,
            source: 'API'
        });

        setGameState(prev => ({
            ...prev,
            problem,
            userAnswers: [],
            errors: [],
            isComplete: false,
            isSubmitted: false,
        }));

        return problem;
    }, [gameState.currentLevel, problemsByLevel, usedProblemKeys]);

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

            // If the problem was already submitted, maintain that state and validate the new answer immediately
            if (prev.isSubmitted) {
                const newAnswerWithValidation = {
                    ...answerWithoutValidation,
                    isCorrect: validateAnswer(prev.problem!, answerWithoutValidation)
                };

                // Replace the unvalidated answer with the validated one
                const validatedAnswers = [...filteredAnswers, newAnswerWithValidation];

                // We should maintain the submitted state, but do NOT update isComplete
                // This way, only explicit submissions (submitProblem) will show the completion message
                return {
                    ...prev,
                    userAnswers: validatedAnswers,
                    isSubmitted: true, // Keep submitted state
                    errors: validatedAnswers
                        .filter(ans => !ans.isCorrect)
                        .map(ans => `Incorrect answer for step ${ans.stepNumber} ${ans.fieldType}`)
                };
            }

            // Normal behavior for pre-submission edits
            return {
                ...prev,
                userAnswers: updatedAnswers,
                isSubmitted: false,
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

            // Maintain the submitted state if it was already submitted
            return {
                ...prev,
                userAnswers: filteredAnswers,
                isComplete: problemComplete,
                isSubmitted: prev.isSubmitted, // Preserve submission state
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

        // Check if skipping ahead
        if (levelId > gameState.currentLevel) {
            console.log(`🚀 Skipping ahead to level ${levelId} (from level ${gameState.currentLevel})`);
        }

        setGameState(prev => ({
            ...prev,
            currentLevel: levelId,
            currentProblem: 1,
            problem: null,
            userAnswers: [],
            errors: [],
            isComplete: false,
        }));

        // Load problems for this level if needed
        loadProblemsForLevel(levelId);
    }, [loadProblemsForLevel, gameState.currentLevel]);

    // Reset current problem
    const resetProblem = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            userAnswers: [],
            errors: [],
            isComplete: false,
            isSubmitted: false, // Explicitly reset the submission state
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
        isLoading,
        fetchError,
        loadProblemsForLevel,
    };
} 