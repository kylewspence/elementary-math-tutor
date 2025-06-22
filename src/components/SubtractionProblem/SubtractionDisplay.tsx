import React, { useEffect, useRef, useCallback } from 'react';
import type { SubtractionProblem, SubtractionUserAnswer, SubtractionGameState } from '../../types/subtraction';
import type { SubtractionCurrentFocus } from '../../hooks/useSubtractionKeyboardNav';
import { GRID_CONSTANTS } from '../../utils/constants';
import Input from '../UI/Input';
import ErrorMessage from '../UI/ErrorMessage';

interface SubtractionDisplayProps {
    problem: SubtractionProblem | null;
    userAnswers: SubtractionUserAnswer[];
    currentFocus: SubtractionCurrentFocus;
    onAnswerSubmit: (answer: SubtractionUserAnswer) => void;
    onAnswerClear: (columnPosition: number, fieldType: 'difference' | 'borrow') => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: string | null;
    onKeyDown: (e: React.KeyboardEvent, onProblemSubmit?: () => void) => void;
    onFieldClick: (columnPosition: number, fieldType: 'difference' | 'borrow') => void;
    gameState?: SubtractionGameState;
    onNextProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
    onUpdateProblem?: (minuend: number, subtrahend: number) => void;
    areAllFieldsFilled?: () => boolean;
}

/**
 * Component for displaying and interacting with subtraction problems
 */
const SubtractionDisplay: React.FC<SubtractionDisplayProps> = ({
    problem,
    userAnswers,
    currentFocus,
    onAnswerSubmit,
    onAnswerClear,
    onProblemSubmit,
    onEnableEditing,
    onDisableEditing,
    isSubmitted,
    isComplete,
    onKeyDown,
    onFieldClick,
    onNextProblem,
    onNewProblem,
    isLoading,
    fetchError,
    onRetryFetch,
    onUpdateProblem,
    areAllFieldsFilled
}) => {
    const activeInputRef = useRef<HTMLInputElement>(null);
    const problemRef = useRef<HTMLDivElement>(null);

    // Auto-focus the active input
    useEffect(() => {
        if (activeInputRef.current) {
            // Add a small delay for mobile browsers to ensure DOM is ready
            setTimeout(() => {
                if (activeInputRef.current) {
                    activeInputRef.current.focus();
                }
            }, 10);
        }
    }, [currentFocus]);

    // Handle clicking outside the problem area to disable editing
    useEffect(() => {
        if (!problem || !problem.isEditable) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if click is outside the editable header area
            if (problemRef.current && !problemRef.current.contains(target)) {
                onDisableEditing?.();
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onDisableEditing?.();
            }
        };

        // Add listeners with a small delay
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }, 150);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [problem, problem?.isEditable, onDisableEditing]);

    // Helper function to check if a column receives a borrow - matches keyboard nav logic exactly
    const receivesBorrow = useCallback((columnPosition: number) => {
        if (!problem) return false;
        const step = problem.steps.find(s => s.columnPosition === columnPosition);
        return step !== undefined && step.borrowReceived > 0;
    }, [problem]);

    // Get all required fields - matches keyboard navigation logic exactly
    const getAllRequiredFields = useCallback(() => {
        if (!problem) return [];

        const fields: { columnPosition: number; fieldType: 'difference' | 'borrow' }[] = [];

        // Sort steps by column position (right to left for navigation order)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // Process each column - UI renders borrow boxes first, then difference boxes
        for (const step of orderedSteps) {
            // Add borrow field if this column receives a borrow (matches UI conditional rendering)
            if (receivesBorrow(step.columnPosition)) {
                fields.push({
                    columnPosition: step.columnPosition,
                    fieldType: 'borrow'
                });
            }

            // Add difference field for this column (UI always renders difference boxes)
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'difference'
            });
        }

        return fields;
    }, [problem, receivesBorrow]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow'): SubtractionUserAnswer | undefined => {
        return userAnswers.find(a => a.columnPosition === columnPosition && a.fieldType === fieldType);
    }, [userAnswers]);

    // Handle auto-advance to next field
    const handleAutoAdvance = useCallback(() => {
        // Small delay to ensure current input is processed
        setTimeout(() => {
            // Use the local function that matches keyboard nav
            const fields = getAllRequiredFields();

            // Find the next field to focus
            const currentIndex = fields.findIndex(
                (field) =>
                    field.columnPosition === currentFocus.columnPosition &&
                    field.fieldType === currentFocus.fieldType
            );

            if (currentIndex < fields.length - 1) {
                const nextField = fields[currentIndex + 1];
                onFieldClick(nextField.columnPosition, nextField.fieldType);
            }
        }, 0);
    }, [currentFocus, onFieldClick, getAllRequiredFields]);

    // Helper to determine input variant (only show colors after submission)
    const getInputVariant = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow') => {
        const userAnswer = getUserAnswer(columnPosition, fieldType);
        const isActive = currentFocus.columnPosition === columnPosition && currentFocus.fieldType === fieldType;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && userAnswer) {
            if (userAnswer.isCorrect === true) return 'correct';
            if (userAnswer.isCorrect === false) return 'error';
            // If isCorrect === null (pending), fall through to default
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    }, [currentFocus, getUserAnswer, isSubmitted]);

    // Handle input change - allow empty values
    const handleInputChange = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow', value: string) => {
        if (value === '') {
            // Clear the answer when value is empty
            onAnswerClear(columnPosition, fieldType);
            return;
        }

        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue)) return;

        // Create answer object for non-empty values
        const answer: SubtractionUserAnswer = {
            columnPosition,
            fieldType,
            value: numericValue,
            isCorrect: false, // Will be validated in the parent
            timestamp: new Date(),
        };

        onAnswerSubmit(answer);
    }, [onAnswerClear, onAnswerSubmit]);

    // Handle problem editing
    const handleMinuendChange = useCallback((value: string) => {
        const newMinuend = parseInt(value, 10);
        if (!isNaN(newMinuend) && newMinuend > 0 && onUpdateProblem && problem) {
            onUpdateProblem(newMinuend, problem.subtrahend);
        }
    }, [onUpdateProblem, problem]);

    const handleSubtrahendChange = useCallback((value: string) => {
        const newSubtrahend = parseInt(value, 10);
        if (!isNaN(newSubtrahend) && newSubtrahend > 0 && onUpdateProblem && problem) {
            onUpdateProblem(problem.minuend, newSubtrahend);
        }
    }, [onUpdateProblem, problem]);

    // Helper function to create an input with consistent keyboard event handling
    const createInput = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow') => {
        return (
            <Input
                ref={currentFocus.columnPosition === columnPosition && currentFocus.fieldType === fieldType ? activeInputRef : undefined}
                value={getUserAnswer(columnPosition, fieldType)?.value?.toString() || ''}
                variant={getInputVariant(columnPosition, fieldType)}
                onChange={(value) => handleInputChange(columnPosition, fieldType, value)}
                onKeyDown={(e) => onKeyDown(e, onProblemSubmit)}
                onClick={() => onFieldClick(columnPosition, fieldType)}
                onAutoAdvance={handleAutoAdvance}
                onBackspace={() => {
                    // Find previous field and move to it
                    const fields = getAllRequiredFields();
                    const currentIndex = fields.findIndex(
                        (field) => field.columnPosition === columnPosition && field.fieldType === fieldType
                    );
                    if (currentIndex > 0) {
                        const prevField = fields[currentIndex - 1];
                        onFieldClick(prevField.columnPosition, prevField.fieldType);
                    }
                }}
                onEnter={isSubmitted && isComplete ? onNextProblem : (areAllFieldsFilled?.() ? onProblemSubmit : undefined)}
                placeholder="?"
            />
        );
    }, [
        activeInputRef,
        areAllFieldsFilled,
        currentFocus,
        getInputVariant,
        getUserAnswer,
        handleAutoAdvance,
        handleInputChange,
        isSubmitted,
        onFieldClick,
        onKeyDown,
        onNextProblem,
        onProblemSubmit,
        getAllRequiredFields
    ]);

    // Check if all input fields have answers
    useEffect(() => {
        if (!problem || !userAnswers.length) {
            return;
        }

        // Get all required fields using local function that matches keyboard nav
        const requiredFields = getAllRequiredFields();

        // Check if we have an answer for each required field
        requiredFields.every(field =>
            userAnswers.some(answer =>
                answer.columnPosition === field.columnPosition &&
                answer.fieldType === field.fieldType
            )
        );

    }, [problem, userAnswers, getAllRequiredFields]);

    // Check if all answers are correct
    const areAllAnswersCorrect = useCallback(() => {
        if (!problem || !userAnswers.length) return false;

        // Get all required fields using local function that matches keyboard nav
        const requiredFields = getAllRequiredFields();

        // Check if we have a correct answer for each required field
        return requiredFields.every(field => {
            const answer = getUserAnswer(field.columnPosition, field.fieldType);
            return answer && answer.isCorrect === true;
        });
    }, [problem, userAnswers, getAllRequiredFields, getUserAnswer]);

    // If problem is null or loading, show loading state
    if (isLoading) {
        return (
            <div className="subtraction-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg">Loading problem...</p>
            </div>
        );
    }

    // If there was an error fetching the problem
    if (fetchError) {
        return (
            <div className="subtraction-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg text-red-500 mb-4">Error loading problem</p>
                <p className="mb-4">{fetchError}</p>
                <button
                    onClick={onRetryFetch}
                    className="px-6 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // If no problem is available yet
    if (!problem) {
        return (
            <div className="subtraction-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg">No problem available</p>
                <button
                    onClick={onNewProblem}
                    className="px-6 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors mt-4"
                >
                    Generate New Problem
                </button>
            </div>
        );
    }

    // Process steps for display - sort in descending order (left to right)
    const displaySteps = [...problem.steps].sort((a, b) => b.columnPosition - a.columnPosition);
    const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;
    const ROW_HEIGHT = BOX_TOTAL_WIDTH;
    const BORROW_HEIGHT = BOX_TOTAL_WIDTH * 0.6; // Smaller height for borrow boxes

    return (
        <div className="subtraction-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
            {/* Problem source badge */}
            <div className="mb-4 flex justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${problem.source === 'api'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                    {problem.source === 'api' ? '🌐 Server Problem' : '💻 Local Problem'}
                </span>
            </div>

            {/* Problem header - clickable to edit */}
            <div className="text-center mb-4" ref={problemRef}>
                <div className="text-xl text-gray-600 flex items-center justify-center gap-2">
                    {problem.isEditable ? (
                        <>
                            <input
                                type="text"
                                value={problem.minuend.toString()}
                                onChange={(e) => handleMinuendChange(e.target.value)}
                                className="w-20 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="First Number"
                                autoFocus
                            />
                            <span>-</span>
                            <input
                                type="text"
                                value={problem.subtrahend.toString()}
                                onChange={(e) => handleSubtrahendChange(e.target.value)}
                                className="w-16 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Second Number"
                            />
                        </>
                    ) : (
                        <div
                            className="cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200"
                            onClick={() => onEnableEditing?.()}
                            title="Click to edit problem"
                        >
                            {problem.minuend} - {problem.subtrahend}
                        </div>
                    )}
                </div>
                {problem.isEditable ? (
                    <div className="text-sm text-blue-600 mt-2">
                        ✏️ Edit the numbers above - click elsewhere when done
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 mt-2">
                        💡 Click the problem above to edit it
                    </div>
                )}
            </div>

            {/* Problem complete notification - compact inline message */}
            {isSubmitted && areAllAnswersCorrect() && (
                <div className="text-center mb-4">
                    <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800 font-semibold">
                        Problem complete! 🎉
                    </div>
                </div>
            )}

            {/* Main content with problem work */}
            <div className="relative">
                {/* Subtraction layout - centered */}
                <div className="flex justify-center">
                    <div className="subtraction-workspace relative">
                        {/* Subtraction grid */}
                        <div className="subtraction-grid relative">
                            {/* Borrow row - now above the minuend */}
                            <div className="flex justify-end mb-1">
                                {/* Borrow boxes for each column that receives a borrow */}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`borrow-input-${step.columnPosition}`}
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BORROW_HEIGHT}px` }}
                                    >
                                        {receivesBorrow(step.columnPosition) && (
                                            <div className="scale-70 transform origin-center">
                                                {createInput(step.columnPosition, 'borrow')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Minuend */}
                            <div className="flex justify-end mb-2">
                                {displaySteps.map((step) => (
                                    <div
                                        key={`minuend-${step.columnPosition}`}
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {step.digit1 === 0 && step.columnPosition > 0 ? '' : (step.digit1 ?? '')}
                                    </div>
                                ))}
                            </div>

                            {/* Subtrahend with minus sign */}
                            <div className="flex justify-end mb-2">
                                <div
                                    className="flex items-center justify-center text-xl font-bold mr-2"
                                >
                                    -
                                </div>
                                {displaySteps.map((step) => (
                                    <div
                                        key={`subtrahend-${step.columnPosition}`}
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {step.digit2 === 0 && step.columnPosition > 0 ? '' : (step.digit2 ?? '')}
                                    </div>
                                ))}
                            </div>

                            {/* Line to separate minuend/subtrahend from difference */}
                            <div className="border-b-2 border-gray-800 w-full mb-2"></div>

                            {/* Difference row (user inputs) */}
                            <div className="flex justify-end">
                                {/* Difference boxes for each column */}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`difference-input-${step.columnPosition}`}
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {createInput(step.columnPosition, 'difference')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Button layout - Always visible sticky controls */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 mt-8">
                <div className="flex flex-col items-center">
                    {/* Submit/Next Problem button */}
                    {!isSubmitted ? (
                        <button
                            onClick={onProblemSubmit}
                            disabled={!areAllFieldsFilled?.()}
                            className={`px-6 py-2 rounded-lg font-semibold mb-4 ${!areAllFieldsFilled?.()
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                } transition-colors`}
                        >
                            <span className="flex items-center justify-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Submit Answers
                            </span>
                        </button>
                    ) : areAllAnswersCorrect() ? (
                        <button
                            onClick={() => onNextProblem?.()}
                            className="px-6 py-2 rounded-lg font-semibold mb-4 bg-green-500 text-white hover:bg-green-600 transition-colors"
                            autoFocus
                        >
                            <span className="flex items-center justify-center gap-1">
                                Next Problem →
                            </span>
                        </button>
                    ) : (
                        // Show helpful feedback when submitted but not complete (has wrong answers)
                        <ErrorMessage
                            onSubmit={() => onProblemSubmit?.()}
                            disabled={!areAllFieldsFilled?.()}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default SubtractionDisplay;