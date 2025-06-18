import React, { useEffect, useRef } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../../types/multiplication';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';
import { SubmitControls } from '../Shared';

// Use the same constants as division for grid layout
// const { BOX_TOTAL_WIDTH } = GRID_CONSTANTS;
// const ROW_HEIGHT = 40; // Height of each row in pixels

interface MultiplicationDisplayProps {
    problem: MultiplicationProblem | null;
    userAnswers: MultiplicationUserAnswer[];
    currentFocus: MultiplicationCurrentFocus | null;
    onAnswerSubmit: (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onAnswerClear: (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
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
    setCurrentFocus?: (focus: MultiplicationCurrentFocus | null) => void;
    moveNext?: () => void;
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
    onResetProblem,
    onNewProblem,
    isLoading = false,
    fetchError,
    onRetryFetch,
    onUpdateProblem,
    isComplete = false,
    setCurrentFocus,
    moveNext
}) => {
    const activeInputRef = useRef<HTMLInputElement>(null);
    const problemRef = useRef<HTMLDivElement>(null);
    // Removed unused allFieldsFilled state
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

    // Removed unused allFieldsFilled effect

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
            currentFocus?.fieldType === fieldType &&
            currentFocus?.fieldPosition === position &&
            currentFocus?.partialIndex === partialIndex;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && userAnswer) {
            return userAnswer.isCorrect === true ? 'correct' : 'error';
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isActive) return 'active';

        return 'default';
    };

    // Removed unused handleAutoAdvance function

    // Helper function to create an input with robust navigation and clearing
    const createInput = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        const isActive =
            currentFocus?.fieldType === fieldType &&
            currentFocus?.fieldPosition === position &&
            currentFocus?.partialIndex === partialIndex;
        const userAnswer = getUserAnswer(fieldType, position, partialIndex);
        return (
            <Input
                ref={isActive ? activeInputRef : undefined}
                value={userAnswer?.value?.toString() || ''}
                variant={getInputVariant(fieldType, position, partialIndex)}
                onChange={(value) => {
                    if (value === '') onAnswerClear(fieldType, position, partialIndex);
                    else {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) onAnswerSubmit(numValue, fieldType, position, partialIndex);
                    }
                }}
                onKeyDown={onKeyDown}
                onClick={() => onFieldClick(fieldType, position, partialIndex)}
                onAutoAdvance={moveNext}
                onEnter={isSubmitted ? onNextProblem : undefined}
                placeholder="?"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={`${fieldType} input for position ${position}`}
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
        const gridWidth = Math.max(
            multiplicandStr.length + multiplierStr.length,
            productStr.length
        ) * BOX_TOTAL_WIDTH;

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
                    {/* Leftmost space for alignment if we have a leftmost carry */}
                    {needsLeftmostCarry && (
                        <div
                            key="multiplicand-leftmost-space"
                            className="flex items-center justify-center text-xl"
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BOX_TOTAL_WIDTH}px` }}
                        >
                        </div>
                    )}
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
                    {needsLeftmostCarry && (
                        <div
                            key="multiplier-leftmost-space"
                            className="flex items-center justify-center text-xl"
                            style={{ width: `${BOX_TOTAL_WIDTH}px`, height: `${BOX_TOTAL_WIDTH}px` }}
                        >
                        </div>
                    )}
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
            <div className="multiplication-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
                <p className="text-lg">Loading problem...</p>
            </div>
        );
    }

    // Error state
    if (fetchError) {
        return (
            <div className="multiplication-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
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
            <div className="multiplication-display bg-white p-8 rounded-xl border-2 border-gray-200 font-mono text-center">
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
            <div className="relative mt-16">
                {/* Multiplication layout - centered */}
                <div className="flex justify-center">
                    <div className="multiplication-workspace relative">
                        {renderMultiplicationGrid()}
                    </div>
                </div>

            </div>

            {/* Submit controls using shared component */}
            <div className="flex flex-col items-center mt-[-2rem]">
                <SubmitControls
                    isSubmitted={isSubmitted}
                    isComplete={isComplete}
                    allFieldsFilled={userAnswers.length > 0}
                    onSubmit={onProblemSubmit || (() => { })}
                    onReset={onResetProblem || (() => { })}
                    onGenerateNew={onNewProblem || (() => { })}
                    onNextProblem={onNextProblem || (() => { })}
                    operation="multiplication"
                    variant="triangle"
                    problemData={{
                        multiplicand: problem?.multiplicand,
                        multiplier: problem?.multiplier,
                        product: problem?.product
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

export default MultiplicationDisplay; 