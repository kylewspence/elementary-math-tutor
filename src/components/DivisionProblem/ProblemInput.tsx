import React from 'react';
import type { ProblemInputProps } from '../../types/division';
import { validateDivisor, validateDividend } from '../../utils/validation';
import Input from '../UI/Input';
import Button from '../UI/Button';

const ProblemInput: React.FC<ProblemInputProps> = ({
    problem,
    onChange,
    onGenerate,
    disabled = false,
}) => {
    const { divisor, dividend } = problem;

    // Handle divisor change
    const handleDivisorChange = (value: string) => {
        const numericValue = parseInt(value) || 0;

        onChange({
            ...problem,
            divisor: numericValue,
        });
    };

    // Handle dividend change
    const handleDividendChange = (value: string) => {
        const numericValue = parseInt(value) || 0;

        onChange({
            ...problem,
            dividend: numericValue,
        });
    };

    // Validate current problem
    const divisorValidation = validateDivisor(divisor);
    const dividendValidation = validateDividend(dividend);
    const isValid = divisorValidation.isValid && dividendValidation.isValid;

    return (
        <div className="problem-input bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Division Problem Setup
            </h2>

            <div className="flex items-center justify-center gap-4 mb-6">
                {/* Dividend Input */}
                <div className="text-center">
                    <Input
                        value={dividend.toString()}
                        onChange={handleDividendChange}
                        maxLength={4}
                        disabled={disabled}
                        aria-label="Enter the dividend (number being divided)"
                        className="w-20"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Number being divided
                    </div>
                </div>

                <div className="text-3xl font-bold text-gray-600 mt-6">÷</div>

                {/* Divisor Input */}
                <div className="text-center">
                    <Input
                        value={divisor.toString()}
                        onChange={handleDivisorChange}
                        maxLength={3}
                        disabled={disabled}
                        aria-label="Enter the divisor (number to divide by)"
                        className="w-20"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Number to divide by
                    </div>
                </div>

                <div className="text-3xl font-bold text-gray-600 mt-6">=</div>

                {/* Result Preview */}
                <div className="text-center">
                    <div className="w-20 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mt-6">
                        <span className="text-gray-400">?</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Quotient
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-3">
                <Button
                    variant="primary"
                    disabled={!isValid || disabled}
                    aria-label="Start the division problem"
                >
                    Start Problem
                </Button>

                <Button
                    variant="secondary"
                    onClick={onGenerate}
                    disabled={disabled}
                    aria-label="Generate a random division problem"
                >
                    Generate Random
                </Button>

                <Button
                    variant="neutral"
                    disabled={disabled}
                    aria-label="Reset to default problem"
                >
                    Reset
                </Button>
            </div>

            {/* Problem Preview */}
            {isValid && (
                <div className="mt-4 text-center">
                    <div className="inline-block bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="font-mono text-lg">
                            {dividend} ÷ {divisor} = ?
                        </span>
                    </div>
                </div>
            )}

            {/* Validation Messages */}
            {(!divisorValidation.isValid || !dividendValidation.isValid) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800 text-sm">
                        <strong>Please fix the following:</strong>
                        <ul className="mt-1 list-disc list-inside">
                            {!divisorValidation.isValid && (
                                <li>{divisorValidation.error}</li>
                            )}
                            {!dividendValidation.isValid && (
                                <li>{dividendValidation.error}</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemInput; 