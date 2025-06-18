import React, { useEffect, useCallback } from 'react';
import Button from '../UI/Button';
import ProblemComplete from '../UI/ProblemComplete';
import type { MathOperation } from '../../types/math';
import { UI_CONSTANTS } from '../../utils/constants';

export interface SubmitControlsProps {
    // State
    isSubmitted: boolean;
    isComplete: boolean;
    allFieldsFilled: boolean;
    isValid?: boolean;

    // Callbacks
    onSubmit: () => void;
    onNextProblem: () => void;
    onReset: () => void;
    onGenerateNew: () => void;

    // Configuration
    operation: MathOperation;
    disabled?: boolean;
    variant?: 'triangle' | 'horizontal' | 'vertical';
    showValidation?: boolean;
    className?: string;

    // Problem data for completion display
    problemData?: {
        dividend?: number;
        divisor?: number;
        quotient?: number;
        remainder?: number;
        multiplicand?: number;
        multiplier?: number;
        product?: number;
        addend1?: number;
        addend2?: number;
        sum?: number;
    };
}

const SubmitControls: React.FC<SubmitControlsProps> = ({
    isSubmitted,
    isComplete,
    allFieldsFilled,
    isValid = true,
    onSubmit,
    onNextProblem,
    onReset,
    onGenerateNew,
    operation,
    disabled = false,
    variant = 'triangle',
    showValidation = true,
    className = '',
    problemData = {}
}) => {
    // Keyboard shortcuts handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't interfere with input fields
        if (e.target instanceof HTMLInputElement) {
            return;
        }

        switch (e.key) {
            case 'Enter':
                if (!isSubmitted && allFieldsFilled && !disabled) {
                    e.preventDefault();
                    onSubmit();
                } else if (isComplete) {
                    e.preventDefault();
                    onNextProblem();
                }
                break;
            case 'r':
            case 'R':
                if (isSubmitted && !disabled) {
                    e.preventDefault();
                    onReset();
                }
                break;
            case 'g':
            case 'G':
                if (isSubmitted && !disabled) {
                    e.preventDefault();
                    onGenerateNew();
                }
                break;
            case 'n':
            case 'N':
                if (isComplete && !disabled) {
                    e.preventDefault();
                    onNextProblem();
                }
                break;
        }
    }, [isSubmitted, isComplete, allFieldsFilled, disabled, onSubmit, onNextProblem, onReset, onGenerateNew]);

    // Set up keyboard event listeners
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Render pre-submit state (submit button only)
    const renderPreSubmitState = () => {
        return (
            <Button
                onClick={onSubmit}
                disabled={!allFieldsFilled || disabled || !isValid}
                variant="primary"
                size="md"
                className={`flex items-center justify-center gap-2 ${UI_CONSTANTS.LAYOUT.BUTTON_HEIGHT} min-w-[140px]`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Submit Answers
            </Button>
        );
    };

    // Render post-submit state (action buttons)
    const renderPostSubmitState = () => {
        const buttons = (
            <>
                <Button
                    onClick={onReset}
                    disabled={disabled}
                    variant="secondary"
                    size="md"
                    className={`flex items-center justify-center gap-2 ${UI_CONSTANTS.LAYOUT.BUTTON_HEIGHT} min-w-[120px]`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Reset</span>
                    <span className="text-xs opacity-75">(R)</span>
                </Button>
                <Button
                    onClick={onGenerateNew}
                    disabled={disabled}
                    variant="neutral"
                    size="md"
                    className={`flex items-center justify-center gap-2 ${UI_CONSTANTS.LAYOUT.BUTTON_HEIGHT} min-w-[120px]`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Generate</span>
                    <span className="text-xs opacity-75">(G)</span>
                </Button>
            </>
        );

        if (variant === 'horizontal') {
            return (
                <div className="flex flex-row gap-3 items-center justify-center">
                    {buttons}
                </div>
            );
        } else if (variant === 'vertical') {
            return (
                <div className="flex flex-col gap-3 items-center w-full max-w-[140px]">
                    {buttons}
                </div>
            );
        } else {
            // Triangle layout (default) - buttons side by side
            return (
                <div className="flex flex-row gap-3 items-center justify-center">
                    {buttons}
                </div>
            );
        }
    };

    // Main render logic
    const baseClasses = `submit-controls ${className}`.trim();

    return (
        <div className={baseClasses}>
            {/* Show completion celebration if problem is complete */}
            {isSubmitted && isComplete && problemData && (
                <div className="relative mb-6">
                    <ProblemComplete
                        type={operation}
                        problem={problemData}
                        onNextProblem={onNextProblem}
                        variant="card"
                    />
                </div>
            )}

            {/* Control buttons layout */}
            <div className={`control-buttons flex flex-col items-center ${UI_CONSTANTS.TRANSITIONS.NORMAL}`}>
                {!isSubmitted ? (
                    <div className="submit-section">
                        {renderPreSubmitState()}
                    </div>
                ) : (
                    <div className={`action-buttons-section ${variant === 'triangle' ? 'mt-4' : ''}`}>
                        {renderPostSubmitState()}
                    </div>
                )}
            </div>

            {/* Keyboard shortcuts hint */}
            {showValidation && (
                <div className={`keyboard-hints text-xs text-gray-500 text-center mt-3 ${UI_CONSTANTS.TRANSITIONS.NORMAL}`}>
                    {!isSubmitted ? (
                        <div className="flex items-center justify-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd>
                            <span>to submit</span>
                        </div>
                    ) : isComplete ? (
                        <div className="flex items-center justify-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">N</kbd>
                            <span>for Next Problem</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">R</kbd>
                                <span>Reset</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">G</kbd>
                                <span>Generate</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubmitControls; 