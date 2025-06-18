import React, { useEffect, useRef, useState } from 'react';
import type { DivisionProblem, UserAnswer, GameState } from '../../types/game';
import type { CurrentFocus } from '../../hooks/useKeyboardNav';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';
import { SubmitControls } from '../Shared';


interface DivisionDisplayProps {
    problem: DivisionProblem | null;
    userAnswers: UserAnswer[];
    currentFocus: CurrentFocus | null;
    onAnswerSubmit: (answer: UserAnswer) => void;
    onAnswerClear: (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => void;
    onProblemChange?: (dividend: number, divisor: number) => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: Error | null;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFieldClick: (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position?: number) => void;
    gameState?: GameState;
    onNextProblem?: () => void;
    onResetProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
    onUpdateProblem?: (dividend: number, divisor: number) => void;
}

const DivisionDisplay: React.FC<DivisionDisplayProps> = ({
    problem,
    userAnswers,
    currentFocus,
    onAnswerSubmit,
    onAnswerClear,
    // onProblemChange, // Unused prop
    onProblemSubmit,
    onEnableEditing,
    onDisableEditing,
    isSubmitted,
    onKeyDown,
    onFieldClick,
    // gameState, // Unused prop
    onNextProblem,
    onResetProblem,
    onNewProblem,
    isLoading,
    fetchError,
    onRetryFetch,
    onUpdateProblem,
    isComplete
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
        // Early return if problem is null or not editable
        if (!problem || problem.isEditable !== true) return;

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

    // Check if all input fields have answers
    useEffect(() => {
        if (!problem || !userAnswers.length) {
            setAllFieldsFilled(false);
            return;
        }

        // Get all required fields (similar to Addition's approach)
        const requiredFields = [];
        for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
            const step = problem.steps[stepIndex];

            // Quotient field
            requiredFields.push({ stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 });

            // Multiply digit fields
            const multiplyDigits = getDigitCount(step.multiply);
            for (let pos = 0; pos < multiplyDigits; pos++) {
                requiredFields.push({ stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos });
            }

            // Subtract digit fields
            const subtractDigits = getDigitCount(step.subtract);
            for (let pos = 0; pos < subtractDigits; pos++) {
                requiredFields.push({ stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos });
            }

            // Bring down field (if exists)
            if (step.bringDown !== undefined) {
                requiredFields.push({ stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 });
            }
        }

        // Check if we have an answer for each required field (same logic as Addition)
        const allFilled = requiredFields.every(field =>
            userAnswers.some(answer =>
                answer.stepNumber === field.stepNumber &&
                answer.fieldType === field.fieldType &&
                answer.fieldPosition === field.fieldPosition
            )
        );

        setAllFieldsFilled(allFilled);
    }, [problem, userAnswers]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0): UserAnswer | undefined => {
        return userAnswers.find(a => a.stepNumber === stepNumber && a.fieldType === fieldType && a.fieldPosition === position);
    };

    // Helper to determine input variant (only show colors after submission)
    const getInputVariant = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
        const userAnswer = getUserAnswer(stepNumber, fieldType, position);
        const isActive = currentFocus?.stepNumber === stepNumber && currentFocus?.fieldType === fieldType && currentFocus?.fieldPosition === position;

        // Only show validation colors after explicit submission by the user
        if (isSubmitted && userAnswer) {
            return userAnswer.isCorrect === true ? 'correct' : 'error';
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    };

    // Helper to get number of digits needed for a value
    const getDigitCount = (value: number): number => {
        return value.toString().length;
    };

    // Handle input change - allow empty values
    const handleInputChange = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number, value: string) => {
        if (value === '') {
            // Clear the answer when value is empty
            onAnswerClear(stepNumber, fieldType, position);
            return;
        }

        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue)) return;

        // Create answer object for non-empty values
        const answer: UserAnswer = {
            stepNumber,
            fieldType,
            fieldPosition: position,
            value: numericValue,
            isCorrect: false, // Will be validated in the parent
            timestamp: new Date(),
        };

        onAnswerSubmit(answer);
    };

    // Handle auto-advance to next field
    const handleAutoAdvance = () => {
        if (!problem) return;
        // Find the current field in navigation order
        const allFields = [];
        for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
            const step = problem.steps[stepIndex];
            allFields.push({ stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 });
            const multiplyDigits = getDigitCount(step.multiply);
            for (let pos = multiplyDigits - 1; pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos });
            }
            const subtractDigits = getDigitCount(step.subtract);
            for (let pos = Math.max(0, subtractDigits - 1); pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos });
            }
            if (step.bringDown !== undefined) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 });
            }
        }
        const currentIndex = allFields.findIndex(field =>
            field.stepNumber === currentFocus?.stepNumber &&
            field.fieldType === currentFocus?.fieldType &&
            field.fieldPosition === currentFocus?.fieldPosition
        );
        if (currentIndex >= 0 && currentIndex < allFields.length - 1) {
            const next = allFields[currentIndex + 1];
            onFieldClick(next.stepNumber, next.fieldType as 'quotient' | 'multiply' | 'subtract' | 'bringDown', next.fieldPosition);
        }
    };

    // Handle problem editing
    const handleDividendChange = (value: string) => {
        const newDividend = parseInt(value, 10);
        if (!isNaN(newDividend) && newDividend > 0 && onUpdateProblem && problem) {
            onUpdateProblem(newDividend, problem.divisor);
        }
    };

    const handleDivisorChange = (value: string) => {
        const newDivisor = parseInt(value, 10);
        if (!isNaN(newDivisor) && newDivisor > 0 && onUpdateProblem && problem) {
            onUpdateProblem(problem.dividend, newDivisor);
        }
    };

    // If problem is null or loading, show loading state
    if (isLoading) {
        return (
            <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg">Loading problem...</p>
            </div>
        );
    }

    // If there was an error fetching the problem
    if (fetchError) {
        return (
            <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg text-red-500 mb-4">Error loading problem</p>
                <p className="mb-4">{fetchError.message}</p>
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
            <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
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

    // At this point, we know problem is not null
    const dividendStr = problem.dividend.toString();
    const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;

    // Vertical spacing constants for use throughout the component
    const ROW_HEIGHT = BOX_TOTAL_WIDTH;
    const STEP_SPACING = ROW_HEIGHT * 2.5; // Space between steps

    // Helper function to create an input with consistent keyboard event handling
    const createInput = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
        return (
            <Input
                ref={currentFocus?.stepNumber === stepNumber && currentFocus?.fieldType === fieldType && currentFocus?.fieldPosition === position ? activeInputRef : undefined}
                value={getUserAnswer(stepNumber, fieldType, position)?.value?.toString() || ''}
                variant={getInputVariant(stepNumber, fieldType, position)}
                onChange={(value) => handleInputChange(stepNumber, fieldType, position, value)}
                onKeyDown={onKeyDown}
                onClick={() => onFieldClick(stepNumber, fieldType, position)}
                onAutoAdvance={handleAutoAdvance}
                onEnter={isSubmitted ? onNextProblem : allFieldsFilled ? onProblemSubmit : undefined}
                readOnly={isSubmitted}
                placeholder="?"
                aria-label={`${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} digit ${position + 1}`}
                maxLength={1}
            />
        );
    };

    // New positioning logic
    const renderInputGrid = () => {
        // Create a grid representation of all inputs
        // Each column is one digit position (ones, tens, hundreds, etc.)
        // Each row represents one step in the division process

        // Total grid width based on dividend length
        const gridWidth = dividendStr.length * BOX_TOTAL_WIDTH;

        return (
            <div className="division-grid relative" style={{ width: `${gridWidth}px` }}>
                {/* Remove placeholder since we're aligning divisor and dividend directly */}

                {/* Dividend row - the number being divided */}
                <div className="dividend-row flex justify-center">
                    {dividendStr.split('').map((digit, index) => (
                        <div
                            key={`dividend-${index}`}
                            className="flex items-center justify-center text-xl"
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                        >
                            {digit}
                        </div>
                    ))}
                </div>

                {/* Steps rows - calculation steps */}
                <div
                    className="steps-area mt-6"
                    style={{
                        height: `${problem.steps.length * STEP_SPACING + ROW_HEIGHT}px`,
                        width: '100%' // Ensure full width
                    }}
                >
                    {problem.steps.map((step, stepIndex) => {
                        const multiplyDigits = getDigitCount(step.multiply);
                        const subtractDigits = getDigitCount(step.subtract);

                        // Calculate the position based on dividend and step
                        // This aligns each step with the correct place value in the dividend
                        const stepPosition = dividendStr.length - problem.steps.length + stepIndex;

                        // Calculate positions for alignment
                        const multiplyLeft = stepPosition - multiplyDigits + 1;
                        const subtractLeft = stepPosition - subtractDigits + 1;

                        // Calculate vertical positions
                        const stepTop = stepIndex * STEP_SPACING;
                        const multiplyTop = stepTop;
                        const subtractTop = stepTop + ROW_HEIGHT;

                        return (
                            <div key={`step-${stepIndex}`} className="step-work relative">
                                {/* Multiply row */}
                                <div className="multiply-row flex justify-end absolute" style={{
                                    left: `${multiplyLeft * BOX_TOTAL_WIDTH}px`,
                                    top: `${multiplyTop}px`,
                                    minWidth: `${multiplyDigits * BOX_TOTAL_WIDTH}px` // Ensure minimum width
                                }}>
                                    {Array.from({ length: multiplyDigits }).map((_, digitIndex) => {
                                        const position = multiplyDigits - 1 - digitIndex; // Right to left positioning

                                        return (
                                            <div key={`multiply-box-${digitIndex}`} style={{ width: `${BOX_TOTAL_WIDTH}px` }}>
                                                {createInput(stepIndex, 'multiply', position)}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Subtraction line - needs to be centered under the boxes */}
                                <div
                                    className="subtraction-line border-b border-gray-400 absolute"
                                    style={{
                                        left: `${multiplyLeft * BOX_TOTAL_WIDTH}px`,
                                        top: `${multiplyTop + ROW_HEIGHT - 4}px`,
                                        width: `${multiplyDigits * BOX_TOTAL_WIDTH}px`,
                                        minWidth: '40px' // Ensure minimum width
                                    }}
                                ></div>

                                {/* Subtraction row */}
                                <div className="subtract-row flex justify-end absolute" style={{
                                    left: `${subtractLeft * BOX_TOTAL_WIDTH}px`,
                                    top: `${subtractTop}px`,
                                    minWidth: `${subtractDigits * BOX_TOTAL_WIDTH}px` // Ensure minimum width
                                }}>
                                    {Array.from({ length: subtractDigits }).map((_, digitIndex) => {
                                        const position = subtractDigits - 1 - digitIndex; // Right to left

                                        return (
                                            <div key={`subtract-box-${digitIndex}`} style={{ width: `${BOX_TOTAL_WIDTH}px` }}>
                                                {createInput(stepIndex, 'subtract', position)}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bring down box - if needed */}
                                {step.bringDown !== undefined && (
                                    <div
                                        className="bring-down-box absolute"
                                        style={{
                                            left: `${(stepPosition + 1) * BOX_TOTAL_WIDTH}px`,
                                            top: `${subtractTop}px`
                                        }}
                                    >
                                        {createInput(stepIndex, 'bringDown', 0)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
            {/* Problem header - clickable to edit */}
            <div className="text-center mb-4" ref={problemRef}>
                <div className="text-xl text-gray-600 flex items-center justify-center gap-2">
                    {problem.isEditable ? (
                        <>
                            <input
                                type="text"
                                value={problem.dividend.toString()}
                                onChange={(e) => handleDividendChange(e.target.value)}
                                className="w-20 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Dividend"
                                autoFocus
                            />
                            <span>÷</span>
                            <input
                                type="text"
                                value={problem.divisor.toString()}
                                onChange={(e) => handleDivisorChange(e.target.value)}
                                className="w-16 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Divisor"
                            />
                        </>
                    ) : (
                        <div
                            className="cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200"
                            onClick={() => onEnableEditing?.()}
                            title="Click to edit problem"
                        >
                            {problem.dividend} ÷ {problem.divisor}
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
            {isSubmitted && isComplete && (
                <div className="text-center mb-4">
                    <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800 font-semibold">
                        Problem complete! 🎉
                    </div>
                </div>
            )}

            {/* Main content with problem work */}
            <div className="relative mt-16">
                {/* Division layout - centered */}
                <div className="flex justify-center">
                    <div className="division-workspace relative">
                        {/* Division line and divisor - Position the divisor to align with dividend row */}
                        <div className="flex relative">
                            <div className="divisor-container absolute text-xl font-bold" style={{
                                right: '100%',
                                top: '0',
                                marginRight: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                height: `${ROW_HEIGHT}px`
                            }}>
                                {problem.divisor}
                            </div>

                            <div className="division-symbol" style={{ position: 'relative' }}>
                                {/* Division line - adjusted to proper length */}
                                <div
                                    className="border-l-4 border-t-4 border-gray-800 absolute"
                                    style={{
                                        height: `${ROW_HEIGHT}px`, // Just tall enough for the dividend row
                                        width: `${dividendStr.length * BOX_TOTAL_WIDTH - 4}px`, // Exact width based on dividend
                                        top: '0',
                                        left: '0',
                                        zIndex: 1
                                    }}
                                >
                                    {/* Quotient row - above division line, positioned relative to the division line */}
                                    <div className="quotient-row absolute" style={{
                                        top: `-${ROW_HEIGHT + 8}px`,  // Position above the division line
                                        left: '0',
                                        zIndex: 10, // Ensure quotient is above everything
                                        width: '100%', // Ensure it spans the full width
                                        display: 'flex', // Use flexbox for proper alignment
                                        flexDirection: 'row', // Align boxes horizontally
                                        justifyContent: 'flex-start' // Align from the left
                                    }}>
                                        {/* Calculate proper quotient positioning based on first step's dividend part */}
                                        {(() => {
                                            // Find how many digits are in the first step's dividend part
                                            const firstStepDividendPart = problem.steps[0]?.dividendPart || 0;
                                            const firstStepDigits = firstStepDividendPart.toString().length;

                                            // The quotient should start at the position of the last digit of the first dividend part
                                            const quotientStartPosition = firstStepDigits - 1;
                                            const spacerWidth = quotientStartPosition * BOX_TOTAL_WIDTH;

                                            return (
                                                <div style={{
                                                    width: `${spacerWidth}px`,
                                                    display: 'inline-block'
                                                }}></div>
                                            );
                                        })()}

                                        {/* Generate quotient boxes for each step in the problem */}
                                        {problem.steps.map((_, stepIndex) => {
                                            return (
                                                <div
                                                    key={`quotient-${stepIndex}`}
                                                    style={{
                                                        width: `${BOX_TOTAL_WIDTH}px`,
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {createInput(stepIndex, 'quotient', 0)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Content area with proper spacing */}
                                <div style={{
                                    paddingLeft: '4px',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    {/* All content aligned in a grid */}
                                    {renderInputGrid()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ProblemComplete now handled by SubmitControls component */}
            </div>

            {/* Shared SubmitControls Component */}
            <div className="flex flex-col items-center mt-2">
                <SubmitControls
                    isSubmitted={isSubmitted || false}
                    isComplete={isComplete || false}
                    allFieldsFilled={allFieldsFilled}
                    operation="division"
                    variant="triangle"
                    onSubmit={() => onProblemSubmit?.()}
                    onNextProblem={() => onNextProblem?.()}
                    onReset={() => onResetProblem?.()}
                    onGenerateNew={() => onNewProblem?.()}
                    problemData={problem ? {
                        dividend: problem.dividend,
                        divisor: problem.divisor,
                        quotient: problem.quotient,
                        remainder: problem.remainder
                    } : undefined}
                />
            </div>

            {/* Help text as footnote outside the main container */}
            <div className="text-center text-xs text-gray-500 mt-4">
                Tab to move forward, Shift+Tab to go back, Enter to move/submit, Backspace to delete
            </div>
        </div>
    );
};

export default DivisionDisplay;