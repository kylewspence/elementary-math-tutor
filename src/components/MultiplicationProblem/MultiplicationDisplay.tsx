import React, { useEffect, useRef, useState } from 'react';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../../types/multiplication';
import Input from '../UI/Input';
import { GRID_CONSTANTS } from '../../utils/constants';
import ProblemComplete from '../UI/ProblemComplete';

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
            }
        };

        return (
            <Input
                ref={isActive ? activeInputRef : undefined}
                value={userAnswer?.value?.toString() || ''}
                variant={getInputVariant(fieldType, position, partialIndex)}
                onClick={() => onFieldClick(fieldType, position, partialIndex)}
                onKeyDown={onKeyDown}
                onChange={handleChange}
                readOnly={isSubmitted}
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

                {/* Problem complete notification using the new component */}
                {/* Debug info: isSubmitted={isSubmitted.toString()}, isComplete={isComplete.toString()} */}
                {isSubmitted && isComplete && (
                    <ProblemComplete
                        type="multiplication"
                        problem={{
                            multiplicand: problem?.multiplicand,
                            multiplier: problem?.multiplier,
                            product: problem?.product
                        }}
                        onNextProblem={onNextProblem || (() => { })}
                        variant="card"
                    />
                )}
            </div>

            {/* Tab to move forward help text - now as a footnote */}
            <div className="text-center text-sm text-gray-500 mt-8">
                Press Tab to move to the next field
            </div>

            {/* Button layout in triangle formation */}
            <div className="flex flex-col items-center mt-6">
                {/* Submit button */}
                {!isSubmitted && (
                    <button
                        onClick={() => onProblemSubmit?.()}
                        disabled={!userAnswers.length}
                        className={`px-6 py-2 rounded-lg font-semibold mb-4 ${!userAnswers.length
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
                )}

                {/* Reset and New Problem buttons */}
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onResetProblem}
                        className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        <span className="flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Reset Problem
                        </span>
                    </button>
                    <button
                        onClick={onNewProblem}
                        className="px-6 py-2 rounded-lg font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                        <span className="flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Problem
                        </span>
                    </button>
                </div>
            </div>

            {/* Help text as footnote outside the main container */}
            <div className="text-center text-xs text-gray-500 mt-4">
                Tab to move forward, Shift+Tab to go back, Enter to move/submit, Backspace to delete
            </div>
        </div>
    );
};

export default MultiplicationDisplay; 