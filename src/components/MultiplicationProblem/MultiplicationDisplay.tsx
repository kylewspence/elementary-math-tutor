import React, { useEffect, useRef, useState } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../../types/multiplication';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';

// Use the same constants as division for grid layout
const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;
const ROW_HEIGHT = 40; // Height of each row in pixels

interface MultiplicationDisplayProps {
    problem: MultiplicationProblem | null;
    userAnswers: MultiplicationUserAnswer[];
    currentFocus: MultiplicationCurrentFocus;
    onAnswerSubmit: (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: Error | null;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFieldClick: (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onNextProblem?: () => void;
    onResetProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
    onUpdateProblem?: (multiplicand: number, multiplier: number) => void;
    setCurrentFocus?: (focus: MultiplicationCurrentFocus) => void;
}

const MultiplicationDisplay: React.FC<MultiplicationDisplayProps> = ({
    problem,
    userAnswers,
    currentFocus,
    onAnswerSubmit: onSubmitAnswer,
    onProblemSubmit,
    onEnableEditing,
    onDisableEditing,
    isSubmitted = false,
    onKeyDown,
    onFieldClick,
    onNextProblem,
    onResetProblem,
    onNewProblem,
    isLoading = false,
    fetchError,
    onRetryFetch,
    onUpdateProblem,
    isComplete = false,
    setCurrentFocus
}) => {
    const activeInputRef = useRef<HTMLInputElement>(null);
    const problemRef = useRef<HTMLDivElement>(null);
    const [allFieldsFilled, setAllFieldsFilled] = useState<boolean>(false);
    const firstRenderRef = useRef(true);

    // Set initial focus on first render
    useEffect(() => {
        if (firstRenderRef.current && problem && setCurrentFocus) {
            // Set focus to the rightmost product digit (position 0)
            setCurrentFocus({
                fieldType: 'product',
                fieldPosition: 0,
                partialIndex: undefined
            });
            firstRenderRef.current = false;

            // Ensure focus is set after a short delay to allow the input to render
            setTimeout(() => {
                if (activeInputRef.current) {
                    activeInputRef.current.focus();
                }
            }, 100);
        }
    }, [problem, setCurrentFocus]);

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
    }, [problem, onDisableEditing]);

    // Check if all input fields have answers
    useEffect(() => {
        if (!problem || !userAnswers.length) {
            setAllFieldsFilled(false);
            return;
        }

        // Count total required fields
        let totalFields = 0;

        // Product digits
        totalFields += problem.product.toString().length;

        // Carry digits (estimate based on product and partial products)
        // This is a simplified calculation - in a real app, you'd calculate exact carries needed
        if (problem.multiplier >= 10) {
            totalFields += Math.floor(problem.product.toString().length / 2); // Rough estimate for carries
        } else {
            // For single-digit multiplier, carry is needed when digit * multiplier >= 10
            const multiplicandStr = problem.multiplicand.toString();
            for (let i = 0; i < multiplicandStr.length; i++) {
                const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - i], 10);
                if (digit * problem.multiplier >= 10) {
                    totalFields += 1; // Add a carry field
                }
            }
        }

        // Check if we have answers for all fields
        setAllFieldsFilled(userAnswers.length >= totalFields);
    }, [problem, userAnswers]);

    // Helper to get user's answer for a specific field
    const getUserAnswer = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number): MultiplicationUserAnswer | undefined => {
        return userAnswers.find(a =>
            a.fieldType === fieldType &&
            a.fieldPosition === position &&
            a.partialIndex === partialIndex
        );
    };

    // Helper to determine input variant (only show colors after submission)
    const getInputVariant = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        const userAnswer = getUserAnswer(fieldType, position, partialIndex);
        const isActive =
            currentFocus.fieldType === fieldType &&
            currentFocus.fieldPosition === position &&
            currentFocus.partialIndex === partialIndex;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && userAnswer) {
            return userAnswer.isCorrect === true ? 'correct' : 'error';
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    };

    // Handle auto-advance to next field
    const handleAutoAdvance = () => {
        // We would need to implement the navigation logic here
        // For now, we'll just use a placeholder implementation
        console.log('Auto-advance triggered');
    };

    // Helper function to create an input with consistent keyboard event handling
    const createInput = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        const isActive =
            currentFocus.fieldType === fieldType &&
            currentFocus.fieldPosition === position &&
            currentFocus.partialIndex === partialIndex;

        return (
            <Input
                ref={isActive ? activeInputRef : undefined}
                value={getUserAnswer(fieldType, position, partialIndex)?.value?.toString() || ''}
                variant={getInputVariant(fieldType, position, partialIndex)}
                onClick={() => onFieldClick(fieldType, position, partialIndex)}
                onKeyDown={onKeyDown}
                onEnter={isSubmitted ? onNextProblem : allFieldsFilled ? onProblemSubmit : undefined}
                onAutoAdvance={handleAutoAdvance}
                readOnly={isSubmitted}
                placeholder="?"
                className={fieldType === 'carry' ? 'carry-input' : ''}
                aria-label={fieldType === 'carry' ? `Carry for position ${position}` : `${fieldType} for position ${position}`}
            />
        );
    };

    // Helper function to determine if a position needs a carry
    const shouldShowCarry = (position: number): boolean => {
        if (!problem) return false;

        // For single-digit multiplier
        if (problem.multiplier < 10) {
            const multiplicandStr = problem.multiplicand.toString();
            // Position is from right to left, so we need to adjust the index
            if (position >= multiplicandStr.length) return false;

            // For the leftmost digit, we don't need a carry box since there's no digit to the left
            if (position === multiplicandStr.length - 1) return false;

            const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - position], 10);
            const product = digit * problem.multiplier;
            return product >= 10; // If product is 10 or more, it would have a carry
        }

        // For multi-digit multipliers, this would be more complex
        // For simplicity, we'll just assume carries for positions > 0
        return position > 0 && position < problem.multiplicand.toString().length - 1;
    };

    // Helper to calculate the correct carry value
    const getCorrectCarryValue = (position: number): number => {
        if (!problem) return 0;

        // For single-digit multiplier
        if (problem.multiplier < 10) {
            const multiplicandStr = problem.multiplicand.toString();
            if (position >= multiplicandStr.length) return 0;

            const digit = parseInt(multiplicandStr[multiplicandStr.length - 1 - position], 10);
            const product = digit * problem.multiplier;
            return Math.floor(product / 10); // The carry is the tens digit
        }

        // For multi-digit multipliers, this would be more complex
        // For simplicity, we'll just return 1 for now
        return 1;
    };

    // Handle problem editing
    const handleMultiplicandChange = (value: string) => {
        const newMultiplicand = parseInt(value, 10);
        if (!isNaN(newMultiplicand) && newMultiplicand > 0 && onUpdateProblem && problem) {
            onUpdateProblem(newMultiplicand, problem.multiplier);
        }
    };

    const handleMultiplierChange = (value: string) => {
        const newMultiplier = parseInt(value, 10);
        if (!isNaN(newMultiplier) && newMultiplier > 0 && onUpdateProblem && problem) {
            onUpdateProblem(problem.multiplicand, newMultiplier);
        }
    };

    // Render the multiplication grid
    const renderMultiplicationGrid = () => {
        if (!problem) return null;

        const multiplicandStr = problem.multiplicand.toString();
        const multiplierStr = problem.multiplier.toString();
        const productStr = problem.product.toString();
        const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;

        // Vertical spacing constants for use throughout the component
        const ROW_HEIGHT = BOX_TOTAL_WIDTH;

        // Total grid width based on product length (which should be the longest)
        const gridWidth = Math.max(
            multiplicandStr.length + multiplierStr.length,
            productStr.length
        ) * BOX_TOTAL_WIDTH;

        return (
            <div className="multiplication-grid relative" style={{ width: `${gridWidth}px` }}>
                {/* Carry boxes - positioned ABOVE the multiplicand */}
                <div className="carry-row flex justify-end mb-1">
                    {multiplicandStr.split('').map((_, index) => {
                        // Calculate the position from right to left (0 = rightmost)
                        const position = multiplicandStr.length - 1 - index;

                        // Only render carry boxes where needed
                        const showCarry = shouldShowCarry(position);
                        if (!showCarry) return (
                            <div
                                key={`carry-space-${position}`}
                                style={{ width: `${BOX_TOTAL_WIDTH}px`, height: '20px' }}
                            ></div>
                        );

                        return (
                            <div
                                key={`carry-product-${position}`}
                                className="flex items-center justify-center"
                                style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT * 0.6}px` }}
                            >
                                <div className="scale-70 transform origin-center">
                                    {createInput('carry', position, 0)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Multiplicand row */}
                <div className="multiplicand-row flex justify-end">
                    {multiplicandStr.split('').map((digit, index) => (
                        <div
                            key={`multiplicand-${index}`}
                            className="flex items-center justify-center text-xl"
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                        >
                            {digit}
                        </div>
                    ))}
                </div>

                {/* Multiplier row with multiplication symbol */}
                <div className="multiplier-row flex justify-end items-center">
                    <div className="mr-2 font-bold">×</div>
                    {multiplierStr.split('').map((digit, index) => (
                        <div
                            key={`multiplier-${index}`}
                            className="flex items-center justify-center text-xl"
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${ROW_HEIGHT}px` }}
                        >
                            {digit}
                        </div>
                    ))}
                </div>

                {/* Line separator */}
                <div className="border-b-2 border-gray-800 w-full my-2"></div>

                {/* Product digits - in correct order (right to left) */}
                <div className="flex justify-end">
                    {Array.from({ length: productStr.length }).map((_, index) => {
                        // We need to reverse the index for display purposes
                        // since we're displaying right-to-left but the positions are 0-indexed from right
                        const displayPosition = productStr.length - 1 - index;

                        return (
                            <div
                                key={`product-${displayPosition}`}
                                style={{ width: `${BOX_TOTAL_WIDTH}px` }}
                            >
                                {createInput('product', displayPosition)}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg">Loading problem...</p>
            </div>
        );
    }

    // Error state
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

    // No problem state
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

    return (
        <div className="division-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
            {/* Problem header - clickable to edit */}
            <div className="text-center mb-16" ref={problemRef}>
                <div className="text-xl text-gray-600 flex items-center justify-center gap-2">
                    {problem.isEditable ? (
                        <>
                            <input
                                type="text"
                                value={problem.multiplicand.toString()}
                                onChange={(e) => handleMultiplicandChange(e.target.value)}
                                className="w-20 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Multiplicand"
                                autoFocus
                            />
                            <span>×</span>
                            <input
                                type="text"
                                value={problem.multiplier.toString()}
                                onChange={(e) => handleMultiplierChange(e.target.value)}
                                className="w-16 text-center border-2 border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Multiplier"
                            />
                        </>
                    ) : (
                        <div
                            className="cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200"
                            onClick={() => onEnableEditing?.()}
                            title="Click to edit problem"
                        >
                            {problem.multiplicand} × {problem.multiplier}
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

            {/* Main content with problem work */}
            <div className="relative">
                {/* Multiplication layout - centered */}
                <div className="flex justify-center">
                    <div className="multiplication-workspace relative">
                        {renderMultiplicationGrid()}
                    </div>
                </div>
            </div>

            {/* Tab to move forward help text - now as a footnote */}
            <div className="text-center text-sm text-gray-500 mt-8">
                Press Tab to move to the next field
            </div>

            {/* Problem complete notification */}
            {isSubmitted && isComplete && (
                <div className="problem-complete-notification mt-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-md shadow-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm leading-5 text-green-700">
                                Great job! You've completed this problem correctly.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-center mt-8 gap-4">
                {/* Button layout in a triangle formation */}
                <div className="flex flex-col items-center gap-4">
                    {/* Top button */}
                    {isSubmitted ? (
                        <button
                            onClick={onNextProblem}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            autoFocus
                        >
                            Next Problem →
                        </button>
                    ) : (
                        <button
                            onClick={onProblemSubmit}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            disabled={!allFieldsFilled}
                        >
                            Submit
                        </button>
                    )}

                    {/* Bottom row buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onResetProblem}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onNewProblem}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                        >
                            New Problem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiplicationDisplay; 