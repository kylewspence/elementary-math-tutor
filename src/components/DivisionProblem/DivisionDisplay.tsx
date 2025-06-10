import React, { useEffect, useRef } from 'react';
import type { DivisionProblem, UserAnswer } from '../../types/game';
import type { CurrentFocus } from '../../hooks/useKeyboardNav';
import Input from '../UI/Input';

interface DivisionDisplayProps {
    problem: DivisionProblem;
    userAnswers: UserAnswer[];
    currentFocus: CurrentFocus;
    onAnswerSubmit: (answer: UserAnswer) => void;
    onAnswerClear: (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFieldClick: (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position?: number) => void;
}

const DivisionDisplay: React.FC<DivisionDisplayProps> = ({
    problem,
    userAnswers,
    currentFocus,
    onAnswerSubmit,
    onAnswerClear,
    onKeyDown,
    onFieldClick,
}) => {
    const activeInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the active input
    useEffect(() => {
        if (activeInputRef.current) {
            activeInputRef.current.focus();
        }
    }, [currentFocus]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0): UserAnswer | undefined => {
        return userAnswers.find(a => a.stepNumber === stepNumber && a.fieldType === fieldType && a.fieldPosition === position);
    };

    // Helper to determine input variant
    const getInputVariant = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
        const userAnswer = getUserAnswer(stepNumber, fieldType, position);
        const isActive = currentFocus.stepNumber === stepNumber && currentFocus.fieldType === fieldType && currentFocus.fieldPosition === position;

        if (isActive) return 'active';
        if (userAnswer?.isCorrect === true) return 'correct';
        if (userAnswer?.isCorrect === false) return 'error';
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
            // Don't use the global keyboard handler, just move to next field
            if (currentFocus.fieldType === 'multiply') {
                const step = problem.steps[currentFocus.stepNumber];
                const multiplyDigits = getDigitCount(step.multiply);
                if (currentFocus.fieldPosition > 0) {
                    // Move to next multiply digit
                    onFieldClick(currentFocus.stepNumber, 'multiply', currentFocus.fieldPosition - 1);
                } else {
                    // Move to subtract
                    onFieldClick(currentFocus.stepNumber, 'subtract', Math.max(0, getDigitCount(step.subtract) - 1));
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
            } else if (currentFocus.fieldType === 'quotient') {
                // Move to multiply
                const step = problem.steps[currentFocus.stepNumber];
                onFieldClick(currentFocus.stepNumber, 'multiply', getDigitCount(step.multiply) - 1);
            } else if (currentFocus.fieldType === 'bringDown') {
                // Move to next step quotient
                if (currentFocus.stepNumber + 1 < problem.steps.length) {
                    onFieldClick(currentFocus.stepNumber + 1, 'quotient', 0);
                }
            }
        }, 100);
    };

    const dividendStr = problem.dividend.toString();

    return (
        <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
            {/* Problem header */}
            <div className="text-center mb-6">
                <div className="text-xl text-gray-600">
                    {problem.dividend} ÷ {problem.divisor}
                </div>
            </div>

            {/* Division layout */}
            <div className="flex justify-center">
                <div className="division-workspace">

                    {/* Quotient row - ABOVE the division line */}
                    <div className="flex items-end mb-1">
                        <div className="w-16 mr-4"></div> {/* Spacer for divisor */}
                        <div className="flex gap-2">
                            {problem.steps.map((step, index) => (
                                <Input
                                    key={`quotient-${index}`}
                                    ref={currentFocus.stepNumber === index && currentFocus.fieldType === 'quotient' && currentFocus.fieldPosition === 0 ? activeInputRef : undefined}
                                    value={getUserAnswer(index, 'quotient', 0)?.value?.toString() || ''}
                                    variant={getInputVariant(index, 'quotient', 0)}
                                    onChange={(value) => handleInputChange(index, 'quotient', 0, value)}
                                    onKeyDown={onKeyDown}
                                    onClick={() => onFieldClick(index, 'quotient', 0)}
                                    onAutoAdvance={handleAutoAdvance}
                                    placeholder="?"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Division line and dividend */}
                    <div className="flex items-center">
                        <div className="w-16 text-right mr-4 text-xl font-bold">{problem.divisor}</div>
                        <div className="border-l-4 border-t-4 border-gray-800 pl-4 pt-2">
                            {/* Dividend */}
                            <div className="flex gap-2 pb-2">
                                {dividendStr.split('').map((digit, index) => (
                                    <div key={`dividend-${index}`} className="w-12 h-12 flex items-center justify-center text-xl">
                                        {digit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Working area - with multiple boxes for multi-digit numbers */}
                    <div className="ml-20 mt-6 space-y-6">
                        {problem.steps.map((step, stepIndex) => {
                            const multiplyDigits = getDigitCount(step.multiply);
                            const subtractDigits = getDigitCount(step.subtract);

                            return (
                                <div key={`step-${stepIndex}`} className="step-work">

                                    {/* Multiplication result input - multiple boxes for multi-digit */}
                                    <div className="flex gap-2 mb-2">
                                        {Array.from({ length: multiplyDigits }, (_, digitIndex) => {
                                            const position = multiplyDigits - 1 - digitIndex; // Right to left positioning
                                            const correctDigit = getDigitAtPosition(step.multiply, position);

                                            return (
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
                                            );
                                        })}
                                    </div>

                                    {/* Subtraction line */}
                                    <div className="border-b border-gray-400 w-16 mb-2"></div>

                                    {/* Subtraction result and bring down - ON THE SAME ROW */}
                                    <div className="flex gap-2 mb-4">
                                        {/* Subtraction result - multiple boxes for multi-digit */}
                                        {Array.from({ length: Math.max(1, subtractDigits) }, (_, digitIndex) => {
                                            const position = Math.max(1, subtractDigits) - 1 - digitIndex;
                                            const correctDigit = subtractDigits > 0 ? getDigitAtPosition(step.subtract, position) : 0;

                                            return (
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
                                            );
                                        })}

                                        {/* Bring down input box - NEXT TO the subtract result */}
                                        {step.bringDown !== undefined && (
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
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center text-sm text-gray-500">
                💡 Use Tab to move forward, Shift+Tab to go back, Backspace to delete
            </div>
        </div>
    );
};

export default DivisionDisplay; 