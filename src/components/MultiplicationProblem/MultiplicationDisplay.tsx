import React, { useEffect, useRef } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../../types/multiplication';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';
import ErrorMessage from '../UI/ErrorMessage';

// Use the same constants as division for grid layout
// const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;
// const ROW_HEIGHT = 40; // Height of each row in pixels

interface MultiplicationDisplayProps {
    problem: MultiplicationProblem | null;
    userAnswers: MultiplicationUserAnswer[];
    currentFocus: MultiplicationCurrentFocus;
    onAnswerSubmit: (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onAnswerClear: (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onProblemSubmit?: () => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: Error | null;
    onKeyDown: (e: React.KeyboardEvent, onProblemSubmit?: () => void) => void;
    onFieldClick: (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onNextProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
    onUpdateProblem?: (multiplicand: number, multiplier: number) => void;
    moveToNextField?: (fieldType?: 'product' | 'partial' | 'carry', position?: number, partialIndex?: number) => void;
    areAllFieldsFilled?: () => boolean;
}

const MultiplicationDisplay: React.FC<MultiplicationDisplayProps> = ({
    problem,
    userAnswers,
    currentFocus,
    onAnswerSubmit,
    onAnswerClear,
    onProblemSubmit,
    onEnableEditing,
    onDisableEditing,
    isSubmitted = false,
    onKeyDown,
    onFieldClick,
    onNextProblem,
    onNewProblem,
    isLoading = false,
    fetchError,
    onRetryFetch,
    onUpdateProblem,
    isComplete = false,
    moveToNextField,
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
            if (userAnswer.isCorrect === true) return 'correct';
            if (userAnswer.isCorrect === false) return 'error';
            // If userAnswer.isCorrect === null, it's pending - show default styling
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    };

    // Removed unused handleAutoAdvance function

    // Helper function to create an input with consistent keyboard event handling
    const createInput = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        if (!currentFocus) return null;
        const isActive =
            currentFocus.fieldType === fieldType &&
            currentFocus.fieldPosition === position &&
            currentFocus.partialIndex === partialIndex;

        // Get user answer for this field
        const userAnswer = getUserAnswer(fieldType, position, partialIndex);

        // Handle input change
        const handleChange = (value: string) => {
            if (value === '') {
                // Clear the answer
                onAnswerClear(fieldType, position, partialIndex);
                return;
            }

            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
                onAnswerSubmit(numValue, fieldType, position, partialIndex);

                // Auto-advance to next field after successful input
                if (moveToNextField) {
                    setTimeout(() => {
                        moveToNextField(fieldType, position, partialIndex);
                    }, 0);
                }
            }
        };

        return (
            <Input
                ref={isActive ? activeInputRef : undefined}
                value={userAnswer?.value?.toString() || ''}
                variant={getInputVariant(fieldType, position, partialIndex)}
                onClick={() => onFieldClick(fieldType, position, partialIndex)}
                onKeyDown={(e) => onKeyDown(e, onProblemSubmit)}
                onChange={handleChange}
                // Remove onAutoAdvance to prevent unwanted navigation
                onEnter={isSubmitted && isComplete ? onNextProblem : (areAllFieldsFilled?.() ? onProblemSubmit : undefined)}
                onBackspace={() => {
                    // The keyboard navigation hook handles the backspace logic
                    // This callback is called by the Input component when backspace is pressed on an empty field
                    // The actual navigation is handled by the useMultiplicationKeyboardNav hook
                }}
                placeholder="?"
                maxLength={1}
                className={fieldType === 'carry' ? 'carry-input' : ''}
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
            if (position >= multiplicandStr.length + 1) return false; // +1 to allow for leftmost carry

            // Special case for leftmost position
            if (position === multiplicandStr.length) {
                // Check if the leftmost digit multiplication generates a carry
                const leftmostDigit = parseInt(multiplicandStr[0], 10);
                const product = leftmostDigit * problem.multiplier;
                // If the product is 10 or greater, we need an extra carry box
                return product >= 10;
            }

            // For the rightmost digit, we don't need a carry box
            if (position === 0) return false;

            // Check if the digit to the right generates a carry
            const rightPosition = position - 1;
            if (rightPosition < 0) return false;

            const rightDigit = parseInt(multiplicandStr[multiplicandStr.length - 1 - rightPosition], 10);
            const product = rightDigit * problem.multiplier;

            // If the product is 10 or greater, it generates a carry
            return product >= 10;
        }

        // For multi-digit multipliers (not implemented yet)
        return false;
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

        // Check if we need a leftmost carry box
        const needsLeftmostCarry = shouldShowCarry(multiplicandStr.length);

        // Total grid width based on product length (which should be the longest)
        // For single-digit problems, ensure minimum width for proper alignment
        const minWidth = Math.max(2, productStr.length) * BOX_TOTAL_WIDTH;
        const calculatedWidth = Math.max(
            multiplicandStr.length + multiplierStr.length,
            productStr.length
        ) * BOX_TOTAL_WIDTH;
        const gridWidth = Math.max(minWidth, calculatedWidth);

        return (
            <div className="multiplication-grid relative" style={{ width: `${gridWidth}px` }}>
                {/* Carry boxes - positioned ABOVE the multiplicand */}
                <div className="carry-row flex justify-end mb-1">
                    {/* Leftmost carry box if needed */}
                    {needsLeftmostCarry && (
                        <div
                            key="carry-leftmost"
                            className="flex items-center justify-center"
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BOX_TOTAL_WIDTH * 0.6}px` }}
                        >
                            <div className="scale-70 transform origin-center carry-input">
                                {createInput('carry', multiplicandStr.length, 0)}
                            </div>
                        </div>
                    )}

                    {/* Regular carry boxes for each position */}
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
                                style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BOX_TOTAL_WIDTH * 0.6}px` }}
                            >
                                <div className="scale-70 transform origin-center carry-input">
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
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BOX_TOTAL_WIDTH}px` }}
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
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BOX_TOTAL_WIDTH}px` }}
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
        <div className="multiplication-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono">
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

            {/* Problem complete notification - compact inline message */}
            {isSubmitted && isComplete && (
                <div className="text-center mb-4">
                    <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800 font-semibold">
                        Problem complete! 🎉
                    </div>
                </div>
            )}

            {/* Main content with problem work */}
            <div className="relative">
                {/* Multiplication layout - centered */}
                <div className="flex justify-center">
                    <div className="multiplication-workspace relative">
                        {renderMultiplicationGrid()}
                    </div>
                </div>
            </div>

            {/* Button layout - Always visible sticky controls */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 mt-8">
                <div className="flex flex-col items-center">
                    {/* Submit/Next Problem button */}
                    {!isSubmitted ? (
                        <button
                            onClick={() => onProblemSubmit?.()}
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
                    ) : isComplete ? (
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

export default MultiplicationDisplay; 