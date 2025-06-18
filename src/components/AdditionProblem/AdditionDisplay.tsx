import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { AdditionProblem, AdditionUserAnswer, AdditionGameState } from '../../types/addition';
import type { AdditionCurrentFocus } from '../../hooks/useAdditionKeyboardNav';
import { GRID_CONSTANTS } from '../../utils/constants';
import Input from '../UI/Input';
import { SubmitControls } from '../Shared';


interface AdditionDisplayProps {
    problem: AdditionProblem | null;
    userAnswers: AdditionUserAnswer[];
    currentFocus: AdditionCurrentFocus | null;
    onAnswerSubmit: (answer: AdditionUserAnswer) => void;
    onAnswerClear: (columnPosition: number, fieldType: 'sum' | 'carry') => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: string | null;
    onKeyDown: (e: React.KeyboardEvent, onProblemSubmit?: () => void, onNextProblem?: () => void) => void;
    onFieldClick: (columnPosition: number, fieldType: 'sum' | 'carry') => void;
    gameState?: AdditionGameState;
    onNextProblem?: () => void;
    onResetProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
    onUpdateProblem?: (addend1: number, addend2: number) => void;
    moveNext?: () => void;
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
    onKeyDown,
    onFieldClick,
    onNextProblem,
    onResetProblem,
    onNewProblem,
    isLoading,
    fetchError,
    onRetryFetch,
    onUpdateProblem,
    moveNext
}) => {
    const activeInputRef = useRef<HTMLInputElement>(null);
    const problemRef = useRef<HTMLDivElement>(null);
    const [allFieldsFilled, setAllFieldsFilled] = useState<boolean>(false);

    // Auto-focus the active input
    useEffect(() => {
        if (activeInputRef.current) {
            activeInputRef.current.focus();
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



    // Get all required fields for this problem
    const getAllRequiredFields = useCallback(() => {
        if (!problem) return [];

        const fields: { columnPosition: number; fieldType: 'sum' | 'carry' }[] = [];

        // Sort steps by column position (right to left, starting with ones place)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // For each column position, add sum field and then any carry field
        for (const step of orderedSteps) {
            // Add sum field for this column
            fields.push({
                columnPosition: step.columnPosition,
                fieldType: 'sum'
            });

            // If this column generates a carry, add the carry field immediately after
            if (step.carry > 0) {
                const nextColumnPosition = step.columnPosition + 1;
                fields.push({
                    columnPosition: nextColumnPosition,
                    fieldType: 'carry'
                });
            }
        }

        return fields;
    }, [problem]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = useCallback((columnPosition: number, fieldType: 'sum' | 'carry'): AdditionUserAnswer | undefined => {
        return userAnswers.find(a => a.columnPosition === columnPosition && a.fieldType === fieldType);
    }, [userAnswers]);

    // Handle auto-advance to next field using shared navigation
    const handleAutoAdvance = useCallback(() => {
        // Use the shared hook's moveNext function for consistent behavior
        if (moveNext) {
            moveNext();
        }
    }, [moveNext]);

    // Helper to determine input variant (only show colors after submission)
    const getInputVariant = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
        const userAnswer = getUserAnswer(columnPosition, fieldType);
        const isActive = currentFocus?.columnPosition === columnPosition && currentFocus?.fieldType === fieldType;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && userAnswer) {
            return userAnswer.isCorrect === true ? 'correct' : 'error';
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

    // Handle problem editing
    const handleAddend1Change = useCallback((value: string) => {
        const newAddend = parseInt(value, 10);
        if (!isNaN(newAddend) && newAddend > 0 && onUpdateProblem && problem) {
            onUpdateProblem(newAddend, problem.addend2);
        }
    }, [onUpdateProblem, problem]);

    const handleAddend2Change = useCallback((value: string) => {
        const newAddend = parseInt(value, 10);
        if (!isNaN(newAddend) && newAddend > 0 && onUpdateProblem && problem) {
            onUpdateProblem(problem.addend1, newAddend);
        }
    }, [onUpdateProblem, problem]);

    // Helper function to create an input with robust navigation and clearing
    const createInput = useCallback((columnPosition: number, fieldType: 'sum' | 'carry') => {
        const isActive = currentFocus?.columnPosition === columnPosition && currentFocus?.fieldType === fieldType;
        const userAnswer = getUserAnswer(columnPosition, fieldType);
        return (
            <Input
                ref={isActive ? activeInputRef : undefined}
                value={userAnswer?.value?.toString() || ''}
                variant={getInputVariant(columnPosition, fieldType)}
                onChange={(value) => handleInputChange(columnPosition, fieldType, value)}
                onKeyDown={(e) => onKeyDown(e, onProblemSubmit, onNextProblem)}
                onClick={() => onFieldClick(columnPosition, fieldType)}
                onAutoAdvance={handleAutoAdvance}
                onEnter={isSubmitted ? onNextProblem : allFieldsFilled ? onProblemSubmit : undefined}
                placeholder="?"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={`${fieldType} input for column ${columnPosition}`}
            />
        );
    }, [activeInputRef, allFieldsFilled, currentFocus, getInputVariant, getUserAnswer, handleAutoAdvance, handleInputChange, isSubmitted, onFieldClick, onKeyDown, onNextProblem, onProblemSubmit]);

    // Check if all input fields have answers
    useEffect(() => {
        if (!problem || !userAnswers.length) {
            setAllFieldsFilled(false);
            return;
        }

        // Get all required fields
        const requiredFields = getAllRequiredFields();

        // Check if we have an answer for each required field
        const allFilled = requiredFields.every(field =>
            userAnswers.some(answer =>
                answer.columnPosition === field.columnPosition &&
                answer.fieldType === field.fieldType
            )
        );



        setAllFieldsFilled(allFilled);
    }, [problem, userAnswers, getAllRequiredFields]);

    // Check if a column receives a carry
    const receivesCarry = useCallback((columnPosition: number) => {
        if (!problem) return false;

        // Find the step for the previous column
        const previousStep = problem.steps.find(s => s.columnPosition === columnPosition - 1);

        // If there's a previous step and it generates a carry, this column receives it
        return previousStep !== undefined && previousStep.carry > 0;
    }, [problem]);

    // Check if all answers are correct
    const areAllAnswersCorrect = useCallback(() => {
        if (!problem || !userAnswers.length) return false;

        // Get all required fields
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
            {/* Problem header - clickable to edit */}
            <div className="text-center mb-4" ref={problemRef}>
                <div className="text-xl text-gray-600 flex items-center justify-center gap-2">
                    {problem.isEditable ? (
                        <>
                            <input
                                type="text"
                                value={problem.addend1.toString()}
                                onChange={(e) => handleAddend1Change(e.target.value)}
                                className="w-20 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="First Number"
                                autoFocus
                            />
                            <span>+</span>
                            <input
                                type="text"
                                value={problem.addend2.toString()}
                                onChange={(e) => handleAddend2Change(e.target.value)}
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

                {/* ProblemComplete now handled by SubmitControls component */}
            </div>

            {/* Submit Controls - unified triangle layout with completion handling */}
            <div className="flex flex-col items-center mt-6">
                <SubmitControls
                    isSubmitted={isSubmitted || false}
                    isComplete={areAllAnswersCorrect()}
                    allFieldsFilled={allFieldsFilled}
                    onSubmit={onProblemSubmit || (() => { })}
                    onReset={onResetProblem || (() => { })}
                    onGenerateNew={onNewProblem || (() => { })}
                    onNextProblem={onNextProblem || (() => { })}
                    operation="addition"
                    variant="triangle"
                    problemData={{
                        addend1: problem?.addend1,
                        addend2: problem?.addend2,
                        sum: problem?.sum
                    }}
                />
            </div>

            {/* Help text as footnote outside the main container */}
            <div className="text-center text-xs text-gray-500 mt-4">
                Tab to move forward, Shift+Tab to go back, Enter to move/submit, Backspace to delete
            </div>
        </div>
    );
};

export default AdditionDisplay; 