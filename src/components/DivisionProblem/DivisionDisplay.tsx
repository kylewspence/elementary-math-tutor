import React, { useEffect, useRef } from 'react';
import type { DivisionProblem, UserAnswer } from '../../types/game';
import type { CurrentFocus } from '../../hooks/useKeyboardNav';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';

interface DivisionDisplayProps {
    problem: DivisionProblem;
    userAnswers: UserAnswer[];
    currentFocus: CurrentFocus;
    onAnswerSubmit: (answer: UserAnswer) => void;
    onAnswerClear: (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => void;
    onProblemChange?: (dividend: number, divisor: number) => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFieldClick: (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position?: number) => void;
}

const DivisionDisplay: React.FC<DivisionDisplayProps> = ({
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
}) => {
    const activeInputRef = useRef<HTMLInputElement>(null);
    const problemRef = useRef<HTMLDivElement>(null);

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

    // Helper to get user's answer for a specific field
    const getUserAnswer = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0): UserAnswer | undefined => {
        return userAnswers.find(a => a.stepNumber === stepNumber && a.fieldType === fieldType && a.fieldPosition === position);
    };

    // Helper to determine input variant (only show colors after submission)
    const getInputVariant = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
        const userAnswer = getUserAnswer(stepNumber, fieldType, position);
        const isActive = currentFocus.stepNumber === stepNumber && currentFocus.fieldType === fieldType && currentFocus.fieldPosition === position;

        if (isActive) return 'active';

        // Only show validation colors after submission
        if (isSubmitted && userAnswer) {
            if (userAnswer.isCorrect === true) return 'correct';
            if (userAnswer.isCorrect === false) return 'error';
        }

        return 'default';
    };

    // Helper to get number of digits needed for a value
    const getDigitCount = (value: number): number => {
        return value.toString().length;
    };

    // Helper to get digit at specific position (0 = rightmost)
    const getDigitAtPosition = (value: number, position: number): number => {
        const str = value.toString();
        const index = str.length - 1 - position;
        return index >= 0 ? parseInt(str[index]) : 0;
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
        // Small delay to ensure current input is processed
        setTimeout(() => {
            if (currentFocus.fieldType === 'quotient') {
                // Move to multiply - start with the leftmost digit
                const step = problem.steps[currentFocus.stepNumber];
                const multiplyDigits = getDigitCount(step.multiply);
                onFieldClick(currentFocus.stepNumber, 'multiply', multiplyDigits - 1);
            } else if (currentFocus.fieldType === 'multiply') {
                const step = problem.steps[currentFocus.stepNumber];
                if (currentFocus.fieldPosition > 0) {
                    // Move to next multiply digit
                    onFieldClick(currentFocus.stepNumber, 'multiply', currentFocus.fieldPosition - 1);
                } else {
                    // Move to subtract
                    const subtractDigits = getDigitCount(step.subtract);
                    onFieldClick(currentFocus.stepNumber, 'subtract', subtractDigits - 1);
                }
            } else if (currentFocus.fieldType === 'subtract') {
                const step = problem.steps[currentFocus.stepNumber];
                if (currentFocus.fieldPosition > 0) {
                    // Move to next subtract digit
                    onFieldClick(currentFocus.stepNumber, 'subtract', currentFocus.fieldPosition - 1);
                } else if (step.bringDown !== undefined) {
                    // Move to bring down
                    onFieldClick(currentFocus.stepNumber, 'bringDown', 0);
                } else if (currentFocus.stepNumber + 1 < problem.steps.length) {
                    // Move to next step quotient
                    onFieldClick(currentFocus.stepNumber + 1, 'quotient', 0);
                }
            } else if (currentFocus.fieldType === 'bringDown') {
                // Move to next step quotient
                if (currentFocus.stepNumber + 1 < problem.steps.length) {
                    onFieldClick(currentFocus.stepNumber + 1, 'quotient', 0);
                }
            }
        }, 100);
    };

    // Handle problem editing
    const handleDividendChange = (value: string) => {
        const newDividend = parseInt(value, 10);
        if (!isNaN(newDividend) && newDividend > 0 && onProblemChange) {
            onProblemChange(newDividend, problem.divisor);
        }
    };

    const handleDivisorChange = (value: string) => {
        const newDivisor = parseInt(value, 10);
        if (!isNaN(newDivisor) && newDivisor > 0 && onProblemChange) {
            onProblemChange(problem.dividend, newDivisor);
        }
    };

    const dividendStr = problem.dividend.toString();
    const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;

    // Vertical spacing constants for use throughout the component
    const ROW_HEIGHT = BOX_TOTAL_WIDTH;
    const STEP_SPACING = ROW_HEIGHT * 2.5; // Space between steps

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
                        height: `${problem.steps.length * STEP_SPACING + ROW_HEIGHT}px`
                    }}
                >
                    {problem.steps.map((step, stepIndex) => {
                        const multiplyDigits = getDigitCount(step.multiply);
                        const subtractDigits = getDigitCount(step.subtract);

                        // Calculate the position based on dividend and step
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
                                    top: `${multiplyTop}px`
                                }}>
                                    {Array.from({ length: multiplyDigits }).map((_, digitIndex) => {
                                        const position = multiplyDigits - 1 - digitIndex; // Right to left positioning

                                        return (
                                            <div key={`multiply-box-${digitIndex}`} style={{ width: `${BOX_TOTAL_WIDTH}px` }}>
                                                <Input
                                                    key={`multiply-${stepIndex}-${position}`}
                                                    ref={currentFocus.stepNumber === stepIndex && currentFocus.fieldType === 'multiply' && currentFocus.fieldPosition === position ? activeInputRef : undefined}
                                                    value={getUserAnswer(stepIndex, 'multiply', position)?.value?.toString() || ''}
                                                    variant={getInputVariant(stepIndex, 'multiply', position)}
                                                    onChange={(value) => handleInputChange(stepIndex, 'multiply', position, value)}
                                                    onKeyDown={onKeyDown}
                                                    onClick={() => onFieldClick(stepIndex, 'multiply', position)}
                                                    onAutoAdvance={handleAutoAdvance}
                                                    placeholder="?"
                                                />
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
                                        width: `${multiplyDigits * BOX_TOTAL_WIDTH}px`
                                    }}
                                ></div>

                                {/* Subtraction row */}
                                <div className="subtract-row flex justify-end absolute" style={{
                                    left: `${subtractLeft * BOX_TOTAL_WIDTH}px`,
                                    top: `${subtractTop}px`
                                }}>
                                    {Array.from({ length: subtractDigits }).map((_, digitIndex) => {
                                        const position = subtractDigits - 1 - digitIndex; // Right to left

                                        return (
                                            <div key={`subtract-box-${digitIndex}`} style={{ width: `${BOX_TOTAL_WIDTH}px` }}>
                                                <Input
                                                    key={`subtract-${stepIndex}-${position}`}
                                                    ref={currentFocus.stepNumber === stepIndex && currentFocus.fieldType === 'subtract' && currentFocus.fieldPosition === position ? activeInputRef : undefined}
                                                    value={getUserAnswer(stepIndex, 'subtract', position)?.value?.toString() || ''}
                                                    variant={getInputVariant(stepIndex, 'subtract', position)}
                                                    onChange={(value) => handleInputChange(stepIndex, 'subtract', position, value)}
                                                    onKeyDown={onKeyDown}
                                                    onClick={() => onFieldClick(stepIndex, 'subtract', position)}
                                                    onAutoAdvance={handleAutoAdvance}
                                                    placeholder="?"
                                                />
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
                                        <Input
                                            ref={currentFocus.stepNumber === stepIndex && currentFocus.fieldType === 'bringDown' && currentFocus.fieldPosition === 0 ? activeInputRef : undefined}
                                            value={getUserAnswer(stepIndex, 'bringDown', 0)?.value?.toString() || ''}
                                            variant={getInputVariant(stepIndex, 'bringDown', 0)}
                                            onChange={(value) => handleInputChange(stepIndex, 'bringDown', 0, value)}
                                            onKeyDown={onKeyDown}
                                            onClick={() => onFieldClick(stepIndex, 'bringDown', 0)}
                                            onAutoAdvance={handleAutoAdvance}
                                            placeholder="?"
                                        />
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
            <div className="text-center mb-16" ref={problemRef}>
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

            {/* Division layout */}
            <div className="flex justify-center">
                <div className="division-workspace relative">
                    {/* Division line and divisor */}
                    <div className="flex items-center">
                        <div className="divisor-container mr-4 text-xl font-bold text-right" style={{ width: '3rem' }}>
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
                                    zIndex: 10 // Ensure quotient is above everything
                                }}>
                                    {problem.steps.map((step, stepIndex) => {
                                        // Position quotient digit correctly based on the steps
                                        const digitPosition = dividendStr.length - problem.steps.length + stepIndex;

                                        return (
                                            <div
                                                key={`quotient-${stepIndex}`}
                                                className="absolute"
                                                style={{
                                                    left: `${digitPosition * BOX_TOTAL_WIDTH}px`,
                                                }}
                                            >
                                                <Input
                                                    ref={currentFocus.stepNumber === stepIndex && currentFocus.fieldType === 'quotient' && currentFocus.fieldPosition === 0 ? activeInputRef : undefined}
                                                    value={getUserAnswer(stepIndex, 'quotient', 0)?.value?.toString() || ''}
                                                    variant={getInputVariant(stepIndex, 'quotient', 0)}
                                                    onChange={(value) => handleInputChange(stepIndex, 'quotient', 0, value)}
                                                    onKeyDown={onKeyDown}
                                                    onClick={() => onFieldClick(stepIndex, 'quotient', 0)}
                                                    onAutoAdvance={handleAutoAdvance}
                                                    placeholder="?"
                                                />
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

            {/* Submit Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => onProblemSubmit?.()}
                    disabled={!userAnswers.length || isSubmitted}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${!userAnswers.length || isSubmitted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }`}
                >
                    {isSubmitted ? '✓ Submitted' : '📝 Submit Answers'}
                </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center text-sm text-gray-500">
                💡 Use Tab to move forward, Shift+Tab to go back, Backspace to delete
            </div>
        </div>
    );
};

export default DivisionDisplay; 