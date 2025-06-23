import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { AdditionProblem, AdditionUserAnswer, AdditionGameState } from '../../types/addition';
import type { AdditionCurrentFocus } from '../../hooks/useAdditionKeyboardNav';
import { GRID_CONSTANTS } from '../../utils/constants';
import Input from '../UI/Input';
import ErrorMessage from '../UI/ErrorMessage';

interface AdditionDisplayProps {
    problem: AdditionProblem | null;
    userAnswers: AdditionUserAnswer[];
    currentFocus: AdditionCurrentFocus;
    onAnswerSubmit: (answer: AdditionUserAnswer) => void;
    onAnswerClear: (columnPosition: number, fieldType: 'sum' | 'carry') => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: (newAddend1?: number, newAddend2?: number) => void;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: string | null;
    onKeyDown: (e: React.KeyboardEvent, onProblemSubmit?: () => void) => void;
    onFieldClick: (columnPosition: number, fieldType: 'sum' | 'carry') => void;
    gameState?: AdditionGameState;
    onNextProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
    onUpdateProblem?: (addend1: number, addend2: number) => void;
    areAllFieldsFilled?: () => boolean;
}

/**
 * Component for displaying and interacting with addition problems
 */
const AdditionDisplay: React.FC<AdditionDisplayProps> = ({
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

    // State for temporary editing values
    const [tempAddend1, setTempAddend1] = useState<string>('');
    const [tempAddend2, setTempAddend2] = useState<string>('');

    // Update temp values when problem changes or editing starts
    useEffect(() => {
        if (problem) {
            setTempAddend1(problem.addend1.toString());
            setTempAddend2(problem.addend2.toString());
        }
    }, [problem?.addend1, problem?.addend2, problem?.isEditable]);

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
                const newAddend1 = parseInt(tempAddend1, 10);
                const newAddend2 = parseInt(tempAddend2, 10);
                onDisableEditing?.(newAddend1, newAddend2);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                const newAddend1 = parseInt(tempAddend1, 10);
                const newAddend2 = parseInt(tempAddend2, 10);
                onDisableEditing?.(newAddend1, newAddend2);
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
    }, [problem, problem?.isEditable, onDisableEditing, tempAddend1, tempAddend2]);

    // Helper function to check if a column receives a carry - matches keyboard nav logic exactly
    const receivesCarry = useCallback((columnPosition: number) => {
        if (!problem) return false;
        const previousStep = problem.steps.find(s => s.columnPosition === columnPosition - 1);
        return previousStep !== undefined && previousStep.carry > 0;
    }, [problem]);

    // Get all required fields - matches keyboard navigation logic exactly
    const getAllRequiredFields = useCallback(() => {
        if (!problem) return [];

        const fields: { columnPosition: number; fieldType: 'sum' | 'carry' }[] = [];

        // Sort steps by column position (right to left for navigation order)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // Process each column - UI renders carry boxes first, then sum boxes
        for (const step of orderedSteps) {
            // Add carry field if this column receives a carry (matches UI conditional rendering)
            if (receivesCarry(step.columnPosition)) {
                fields.push({
                    columnPosition: step.columnPosition,
                    fieldType: 'carry'
                });
            }

            // Add sum field for this column (UI always renders sum boxes)
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'sum'
            });
        }

        return fields;
    }, [problem, receivesCarry]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = useCallback((columnPosition: number, fieldType: 'sum' | 'carry'): AdditionUserAnswer | undefined => {
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
    const getInputVariant = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
        const userAnswer = getUserAnswer(columnPosition, fieldType);
        const isActive = currentFocus.columnPosition === columnPosition && currentFocus.fieldType === fieldType;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && userAnswer) {
            if (userAnswer.isCorrect === true) return 'correct';
            if (userAnswer.isCorrect === false) return 'error';
            // If userAnswer.isCorrect === null, it's pending - show default styling
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    }, [currentFocus, getUserAnswer, isSubmitted]);

    // Handle input change - allow empty values
    const handleInputChange = useCallback((columnPosition: number, fieldType: 'sum' | 'carry', value: string) => {
        if (value === '') {
            // Clear the answer when value is empty
            onAnswerClear(columnPosition, fieldType);
            return;
        }

        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue)) return;

        // Create answer object for non-empty values
        const answer: AdditionUserAnswer = {
            columnPosition,
            fieldType,
            value: numericValue,
            isCorrect: false, // Will be validated in the parent
            timestamp: new Date(),
        };

        onAnswerSubmit(answer);
    }, [onAnswerClear, onAnswerSubmit]);

    // Helper function to create an input with consistent keyboard event handling
    const createInput = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
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
            <div className="addition-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg">Loading problem...</p>
            </div>
        );
    }

    // If there was an error fetching the problem
    if (fetchError) {
        return (
            <div className="addition-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
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
            <div className="addition-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
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
    const CARRY_HEIGHT = BOX_TOTAL_WIDTH * 0.6; // Smaller height for carry boxes

    return (
        <div className="addition-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
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
                                value={tempAddend1}
                                onChange={(e) => setTempAddend1(e.target.value)}
                                className="w-20 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="First Number"
                                autoFocus
                            />
                            <span>+</span>
                            <input
                                type="text"
                                value={tempAddend2}
                                onChange={(e) => setTempAddend2(e.target.value)}
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
                            {problem.addend1} + {problem.addend2}
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
                {/* Addition layout - centered */}
                <div className="flex justify-center">
                    <div className="addition-workspace relative">
                        {/* Addition grid */}
                        <div className="addition-grid relative">
                            {/* Carry row - now above the addends */}
                            <div className="flex justify-end mb-1">
                                {/* Carry boxes for each column that receives a carry */}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`carry-input-${step.columnPosition}`}
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${CARRY_HEIGHT}px` }}
                                    >
                                        {receivesCarry(step.columnPosition) && (
                                            <div className="scale-70 transform origin-center">
                                                {createInput(step.columnPosition, 'carry')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* First addend */}
                            <div className="flex justify-end mb-2">
                                {displaySteps.map((step) => (
                                    <div
                                        key={`addend1-${step.columnPosition}`}
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {step.digit1 === 0 && step.columnPosition > 0 ? '' : step.digit1}
                                    </div>
                                ))}
                            </div>

                            {/* Second addend with plus sign */}
                            <div className="flex justify-end mb-2">
                                <div
                                    className="flex items-center justify-center text-xl font-bold mr-2"
                                >
                                    +
                                </div>
                                {displaySteps.map((step) => (
                                    <div
                                        key={`addend2-${step.columnPosition}`}
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {step.digit2 === 0 && step.columnPosition > 0 ? '' : step.digit2}
                                    </div>
                                ))}
                            </div>

                            {/* Line to separate addends from sum */}
                            <div className="border-b-2 border-gray-800 w-full mb-2"></div>

                            {/* Sum row (user inputs) */}
                            <div className="flex justify-end">
                                {/* Sum boxes for each column */}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`sum-input-${step.columnPosition}`}
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {createInput(step.columnPosition, 'sum')}
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

export default AdditionDisplay; 