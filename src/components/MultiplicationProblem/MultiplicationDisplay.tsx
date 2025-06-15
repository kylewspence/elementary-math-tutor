import React, { useRef, useEffect } from 'react';
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
    isComplete = false
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

    // Helper to get the answer for a specific field
    const getUserAnswer = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        return userAnswers.find(
            a => a.fieldType === fieldType &&
                a.fieldPosition === position &&
                a.partialIndex === partialIndex
        );
    };

    // Determine the input variant based on the answer and focus
    const getInputVariant = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        const answer = getUserAnswer(fieldType, position, partialIndex);
        const isFocused =
            currentFocus.fieldType === fieldType &&
            currentFocus.fieldPosition === position &&
            currentFocus.partialIndex === partialIndex;

        // After submission, prioritize validation colors over active state
        if (isSubmitted && answer) {
            return answer.isCorrect ? 'correct' : 'error';
        }

        // Only show active state if not submitted or when actively editing after submission
        if (isFocused) return 'active';

        return 'default';
    };

    // Get the value to display in an input field
    const getInputValue = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        const answer = getUserAnswer(fieldType, position, partialIndex);
        return answer ? answer.value.toString() : '';
    };

    // Helper to get number of digits in a number (kept for future use)
    // const getDigitCount = (value: number): number => {
    //     return value.toString().length;
    // };

    // Create input component
    const createInput = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        const value = getInputValue(fieldType, position, partialIndex);
        const variant = getInputVariant(fieldType, position, partialIndex);
        const isFocused =
            currentFocus.fieldType === fieldType &&
            currentFocus.fieldPosition === position &&
            currentFocus.partialIndex === partialIndex;

        return (
            <Input
                key={`${fieldType}-${position}-${partialIndex ?? 'none'}`}
                ref={isFocused ? activeInputRef : undefined}
                value={value}
                variant={variant}
                onClick={() => onFieldClick(fieldType, position, partialIndex)}
                onKeyDown={onKeyDown}
                readOnly={isSubmitted}
                placeholder="?"
                className="w-12 h-12 text-center text-xl"
            />
        );
    };

    // Handle multiplicand change
    const handleMultiplicandChange = (value: string) => {
        if (!problem) return;

        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue <= 0) return;

        onUpdateProblem?.(numValue, problem.multiplier);
    };

    // Handle multiplier change
    const handleMultiplierChange = (value: string) => {
        if (!problem) return;

        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue <= 0) return;

        onUpdateProblem?.(problem.multiplicand, numValue);
    };

    // Render the multiplication grid
    const renderMultiplicationGrid = () => {
        if (!problem) return null;

        const multiplicandStr = problem.multiplicand.toString();
        const multiplierStr = problem.multiplier.toString();
        const productStr = problem.product.toString();

        // Total grid width based on product length (which should be the longest)
        const gridWidth = Math.max(
            multiplicandStr.length + multiplierStr.length,
            productStr.length
        ) * BOX_TOTAL_WIDTH;

        return (
            <div className="multiplication-grid relative" style={{ width: `${gridWidth}px` }}>
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

                {/* Partial products (if multiplier has multiple digits) */}
                {problem.multiplier >= 10 && problem.partialProducts.map((partial, partialIndex) => {
                    const partialStr = partial.value.toString();
                    const position = partial.position;

                    return (
                        <div key={`partial-${partialIndex}`} className="partial-product-row flex justify-end">
                            {/* Carry boxes for this partial product */}
                            <div className="carry-row flex justify-end mb-1">
                                {Array.from({ length: partialStr.length }).map((_, digitIndex) => (
                                    <div
                                        key={`carry-${partialIndex}-${digitIndex}`}
                                        className="flex items-center justify-center"
                                        style={{ width: `${BOX_TOTAL_WIDTH}px`, height: '20px' }}
                                    >
                                        {createInput('carry', digitIndex, partialIndex)}
                                    </div>
                                ))}

                                {/* Add spacing for position */}
                                {Array.from({ length: position }).map((_, i) => (
                                    <div key={`spacer-${partialIndex}-${i}`} style={{ width: `${BOX_TOTAL_WIDTH}px` }}></div>
                                ))}
                            </div>

                            {/* Partial product digits */}
                            <div className="flex justify-end">
                                {Array.from({ length: partialStr.length }).map((_, digitIndex) => (
                                    <div
                                        key={`partial-digit-${partialIndex}-${digitIndex}`}
                                        style={{ width: `${BOX_TOTAL_WIDTH}px` }}
                                    >
                                        {createInput('partial', digitIndex, partialIndex)}
                                    </div>
                                ))}

                                {/* Add spacing for position */}
                                {Array.from({ length: position }).map((_, i) => (
                                    <div key={`spacer-digit-${partialIndex}-${i}`} style={{ width: `${BOX_TOTAL_WIDTH}px` }}></div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Second line separator if there are partial products */}
                {problem.multiplier >= 10 && (
                    <div className="border-b-2 border-gray-800 w-full my-2"></div>
                )}

                {/* Final product row with carry boxes */}
                <div className="product-row">
                    {/* Carry boxes for final product */}
                    <div className="carry-row flex justify-end mb-1">
                        {Array.from({ length: productStr.length }).map((_, index) => (
                            <div
                                key={`carry-product-${index}`}
                                className="flex items-center justify-center"
                                style={{ width: `${BOX_TOTAL_WIDTH}px`, height: '20px' }}
                            >
                                {createInput('carry', index, problem.partialProducts.length)}
                            </div>
                        ))}
                    </div>

                    {/* Product digits */}
                    <div className="flex justify-end">
                        {Array.from({ length: productStr.length }).map((_, index) => (
                            <div
                                key={`product-${index}`}
                                style={{ width: `${BOX_TOTAL_WIDTH}px` }}
                            >
                                {createInput('product', index)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <div className="text-gray-600">Loading problem...</div>
            </div>
        );
    }

    // Error state
    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-red-200">
                <div className="text-red-500 text-xl mb-4">Error loading problem</div>
                <div className="text-gray-600 mb-4">{fetchError.message}</div>
                <button
                    onClick={onRetryFetch}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // No problem state
    if (!problem) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-gray-200">
                <div className="text-gray-600 mb-4">No problem available</div>
                <button
                    onClick={onNewProblem}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Generate Problem
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

                {/* Action buttons */}
                <div className="mt-8 flex justify-center space-x-4">
                    {!isSubmitted && (
                        <button
                            onClick={onProblemSubmit}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Submit Answers
                        </button>
                    )}

                    <button
                        onClick={onResetProblem}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Reset Problem
                    </button>

                    <button
                        onClick={onNewProblem}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        New Problem
                    </button>
                </div>

                {/* Completion message */}
                {isComplete && isSubmitted && (
                    <div className="mt-6 text-center">
                        <div className="text-green-600 font-bold text-xl">✓ Correct!</div>
                        <button
                            onClick={onNextProblem}
                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            autoFocus
                        >
                            Next Problem →
                        </button>
                    </div>
                )}
            </div>

            {/* Keyboard navigation help */}
            <div className="mt-6 text-center text-sm text-gray-500">
                Tab to move forward, Shift+Tab to go back, Enter to move/submit, Backspace to delete
            </div>
        </div>
    );
};

export default MultiplicationDisplay; 