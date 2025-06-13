import React, { useEffect, useRef, useState } from 'react';
import type { AdditionProblem, AdditionUserAnswer, AdditionGameState } from '../../types/addition';
import type { AdditionCurrentFocus } from '../../hooks/useAdditionKeyboardNav';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';

interface AdditionDisplayProps {
    problem: AdditionProblem;
    userAnswers: AdditionUserAnswer[];
    currentFocus: AdditionCurrentFocus;
    onAnswerSubmit: (answer: AdditionUserAnswer) => void;
    onAnswerClear: (columnPosition: number, fieldType: 'sum' | 'carry') => void;
    onProblemChange?: (addend1: number, addend2: number) => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    onKeyDown: (e: React.KeyboardEvent, onProblemSubmit?: () => void, onNextProblem?: () => void) => void;
    onFieldClick: (columnPosition: number, fieldType: 'sum' | 'carry') => void;
    gameState?: AdditionGameState;
    onNextProblem?: () => void;
    onResetProblem?: () => void;
    onNewProblem?: () => void;
}

const AdditionDisplay: React.FC<AdditionDisplayProps> = ({
    problem,
    userAnswers,
    currentFocus,
    onAnswerSubmit,
    onAnswerClear,
    onProblemChange,
    onProblemSubmit,
    onEnableEditing,
    onDisableEditing,
    isSubmitted,
    onKeyDown,
    onFieldClick,
    gameState,
    onNextProblem,
    onResetProblem,
    onNewProblem,
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
        if (!problem.isEditable) return;

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
    }, [problem.isEditable, onDisableEditing]);

    // Check if all input fields have answers
    useEffect(() => {
        if (!problem || !userAnswers.length) {
            setAllFieldsFilled(false);
            return;
        }

        // Count total required fields
        let totalFields = 0;

        // Sum fields for each column
        totalFields += problem.steps.length;

        // Carry fields for columns that need them
        const stepsWithCarry = problem.steps.filter(step => step.carry > 0).length;
        totalFields += stepsWithCarry;

        // Check if we have answers for all fields
        setAllFieldsFilled(userAnswers.length >= totalFields);
    }, [problem, userAnswers]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = (columnPosition: number, fieldType: 'sum' | 'carry'): AdditionUserAnswer | undefined => {
        return userAnswers.find(a => a.columnPosition === columnPosition && a.fieldType === fieldType);
    };

    // Helper to determine input variant (only show colors after submission)
    const getInputVariant = (columnPosition: number, fieldType: 'sum' | 'carry') => {
        const userAnswer = getUserAnswer(columnPosition, fieldType);
        const isActive = currentFocus.columnPosition === columnPosition && currentFocus.fieldType === fieldType;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && userAnswer) {
            return userAnswer.isCorrect === true ? 'correct' : 'error';
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    };

    // Handle input change - allow empty values
    const handleInputChange = (columnPosition: number, fieldType: 'sum' | 'carry', value: string) => {
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
    };

    // Handle auto-advance to next field
    const handleAutoAdvance = () => {
        // Small delay to ensure current input is processed
        setTimeout(() => {
            // Find the next field to focus
            const allFields = getAllFieldsInOrder();
            const currentIndex = allFields.findIndex(
                field => field.columnPosition === currentFocus.columnPosition && field.fieldType === currentFocus.fieldType
            );

            if (currentIndex < allFields.length - 1) {
                const nextField = allFields[currentIndex + 1];
                onFieldClick(nextField.columnPosition, nextField.fieldType);
            }
        }, 0); // Reduced to 0ms for instant response
    };

    // Get all fields in order for navigation
    const getAllFieldsInOrder = (): AdditionCurrentFocus[] => {
        const allFields: AdditionCurrentFocus[] = [];

        // Get the steps in right-to-left order (ones, tens, hundreds)
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);

        // First add all carry fields (from right to left)
        for (const step of orderedSteps) {
            if (step.carry > 0) {
                allFields.push({ columnPosition: step.columnPosition, fieldType: 'carry' });
            }
        }

        // Then add all sum fields (from right to left)
        for (const step of orderedSteps) {
            allFields.push({ columnPosition: step.columnPosition, fieldType: 'sum' });
        }

        return allFields;
    };

    // Handle problem editing
    const handleAddend1Change = (value: string) => {
        const newAddend1 = parseInt(value, 10);
        if (!isNaN(newAddend1) && newAddend1 > 0 && onProblemChange) {
            onProblemChange(newAddend1, problem.addend2);
        }
    };

    const handleAddend2Change = (value: string) => {
        const newAddend2 = parseInt(value, 10);
        if (!isNaN(newAddend2) && newAddend2 > 0 && onProblemChange) {
            onProblemChange(problem.addend1, newAddend2);
        }
    };

    // Constants for layout
    const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;
    const ROW_HEIGHT = BOX_TOTAL_WIDTH;
    const CARRY_HEIGHT = ROW_HEIGHT * 0.6; // Smaller height for carry boxes

    // Helper function to create an input with consistent keyboard event handling
    const createInput = (columnPosition: number, fieldType: 'sum' | 'carry') => {
        return (
            <Input
                ref={currentFocus.columnPosition === columnPosition && currentFocus.fieldType === fieldType ? activeInputRef : undefined}
                value={getUserAnswer(columnPosition, fieldType)?.value?.toString() || ''}
                variant={getInputVariant(columnPosition, fieldType)}
                onChange={(value) => handleInputChange(columnPosition, fieldType, value)}
                onKeyDown={(e) => onKeyDown(e, onProblemSubmit, onNextProblem)}
                onClick={() => onFieldClick(columnPosition, fieldType)}
                onAutoAdvance={handleAutoAdvance}
                onEnter={isSubmitted ? onNextProblem : allFieldsFilled ? onProblemSubmit : undefined}
                placeholder={fieldType === 'carry' ? "1" : "?"}
                aria-label={fieldType === 'carry' ? `Carry for column ${columnPosition + 1}` : `Sum for column ${columnPosition + 1}`}
                className={fieldType === 'carry' ? 'carry-input' : ''}
            />
        );
    };

    // Process steps for display, removing leading zeros and sorting right-to-left
    const processSteps = () => {
        // Sort steps by column position (most significant digit first)
        const sortedSteps = [...problem.steps].sort((a, b) => b.columnPosition - a.columnPosition);

        // Find the first non-zero digit in each addend
        let firstNonZeroIndex1 = -1;
        let firstNonZeroIndex2 = -1;

        for (let i = 0; i < sortedSteps.length; i++) {
            if (firstNonZeroIndex1 === -1 && sortedSteps[i].digit1 !== 0) {
                firstNonZeroIndex1 = i;
            }
            if (firstNonZeroIndex2 === -1 && sortedSteps[i].digit2 !== 0) {
                firstNonZeroIndex2 = i;
            }
            if (firstNonZeroIndex1 !== -1 && firstNonZeroIndex2 !== -1) {
                break;
            }
        }

        // If all digits are zero, keep at least one
        if (firstNonZeroIndex1 === -1) firstNonZeroIndex1 = sortedSteps.length - 1;
        if (firstNonZeroIndex2 === -1) firstNonZeroIndex2 = sortedSteps.length - 1;

        // Get the highest index to start from (to avoid cutting off digits)
        const startIndex = Math.min(firstNonZeroIndex1, firstNonZeroIndex2);

        // Return only the relevant steps
        return sortedSteps.slice(startIndex);
    };

    const displaySteps = processSteps();

    // Check if we need an extra box for the final carry
    // This happens when the sum has more digits than either addend
    const needsExtraBox = problem.sum > Math.pow(10, displaySteps.length) - 1;

    // Helper to determine if a column needs a carry
    const needsCarry = (columnPosition: number) => {
        const step = problem.steps.find(s => s.columnPosition === columnPosition);
        return step && step.carry > 0;
    };

    return (
        <div className="addition-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
            {/* Problem header - clickable to edit */}
            <div className="text-center mb-16" ref={problemRef}>
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

            {/* Main content with problem work and completion card side by side */}
            <div className="relative">
                {/* Addition layout - centered */}
                <div className="flex justify-center">
                    <div className="addition-workspace relative">
                        {/* Addition grid */}
                        <div className="addition-grid relative">
                            {/* Carry row - now above the addends */}
                            <div className="flex justify-end mb-1">
                                {/* Extra box for final carry if needed */}
                                {needsExtraBox && (
                                    <div
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${CARRY_HEIGHT}px` }}
                                    >
                                        <div className="scale-70 transform origin-center">
                                            {createInput(displaySteps.length, 'carry')}
                                        </div>
                                    </div>
                                )}

                                {/* Carry boxes for each column */}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`carry-input-${step.columnPosition}`}
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${CARRY_HEIGHT}px` }}
                                    >
                                        {needsCarry(step.columnPosition) && (
                                            <div className="scale-70 transform origin-center">
                                                {createInput(step.columnPosition, 'carry')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* First addend */}
                            <div className="flex justify-end mb-2">
                                {needsExtraBox && (
                                    <div
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    ></div>
                                )}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`addend1-${step.columnPosition}`}
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {step.digit1}
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
                                {needsExtraBox && (
                                    <div
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    ></div>
                                )}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`addend2-${step.columnPosition}`}
                                        className="flex items-center justify-center text-xl"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {step.digit2}
                                    </div>
                                ))}
                            </div>

                            {/* Line to separate addends from sum */}
                            <div className="border-b-2 border-gray-800 w-full mb-2"></div>

                            {/* Sum row (user inputs) */}
                            <div className="flex justify-end">
                                {/* Extra box for final digit of sum if needed */}
                                {needsExtraBox && (
                                    <div
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                                    >
                                        {createInput(displaySteps.length, 'sum')}
                                    </div>
                                )}

                                {/* Sum boxes for each column */}
                                {displaySteps.map((step) => (
                                    <div
                                        key={`sum-${step.columnPosition}`}
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

                {/* Completion card - positioned to the right without affecting problem layout */}
                {isSubmitted && gameState?.isComplete && (
                    <div className="absolute top-0 right-0 w-64 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-2">🎉</div>
                        <h3 className="text-lg font-bold text-green-800 mb-1">
                            Problem Complete!
                        </h3>
                        <p className="text-sm text-green-700 mb-3">
                            Great job! You solved {problem.addend1} + {problem.addend2} = {problem.sum}
                        </p>
                        <button
                            onClick={onNextProblem}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                            autoFocus
                        >
                            Next Problem →
                        </button>
                    </div>
                )}
            </div>

            {/* Legend for input fields */}
            <div className="mt-4 text-center">
                <div className="inline-flex items-center text-sm text-gray-600 mb-2">
                    <span className="mr-2">💡</span>
                    <span>Fill in the <span className="font-bold">sum</span> in the bottom row and <span className="font-bold">carry values</span> above the numbers</span>
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 text-center">
                <button
                    onClick={() => onProblemSubmit?.()}
                    disabled={!userAnswers.length}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!userAnswers.length
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isSubmitted
                            ? 'bg-blue-500 text-white'
                            : allFieldsFilled
                                ? 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 animate-pulse'
                                : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }`}
                >
                    {isSubmitted ? '✓ Submitted' : allFieldsFilled ? '📝 Submit Answers (Enter)' : '📝 Submit Answers'}
                </button>
            </div>

            {/* Instructions and Control Buttons */}
            <div className="mt-8">
                <div className="text-center text-sm text-gray-500 mb-4">
                    💡 Use Tab to move forward, Shift+Tab to go back, Enter to move/submit, Backspace to delete
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onResetProblem}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        🔄 Reset Problem
                    </button>
                    <button
                        onClick={onNewProblem}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        🎲 New Problem
                    </button>
                </div>
            </div>

            {/* Add CSS for carry inputs */}
            <style>
                {`
                .carry-input {
                    font-size: 0.8em;
                    width: 2rem;
                    height: 2rem;
                    background-color: #f0f8ff;
                    border-color: #b3d9ff;
                }
                `}
            </style>
        </div>
    );
};

export default AdditionDisplay; 