import React from 'react';
import type { BaseProblem, MathOperation } from '../../types/math';
import Input from '../UI/Input';
import Button from '../UI/Button';

export interface ProblemField {
    name: string;
    label: string;
    placeholder?: string;
    maxLength?: number;
    value: string | number;
    onChange: (value: string) => void;
    validation?: {
        isValid: boolean;
        error?: string;
    };
}

export interface ProblemInputProps {
    operation: MathOperation;
    fields: ProblemField[];
    onStartProblem: () => void;
    onGenerate: () => void;
    onReset?: () => void;
    disabled?: boolean;
    isValid: boolean;
    previewText?: string;
    validationMessages?: string[];
}

const operationConfig = {
    division: {
        title: 'Division Problem Setup',
        symbol: '÷',
        resultLabel: 'Quotient'
    },
    addition: {
        title: 'Addition Problem Setup',
        symbol: '+',
        resultLabel: 'Sum'
    },
    multiplication: {
        title: 'Multiplication Problem Setup',
        symbol: '×',
        resultLabel: 'Product'
    }
} as const;

const ProblemInput: React.FC<ProblemInputProps> = ({
    operation,
    fields,
    onStartProblem,
    onGenerate,
    onReset,
    disabled = false,
    isValid,
    previewText,
    validationMessages = []
}) => {
    const config = operationConfig[operation];

    return (
        <div className="problem-input bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {config.title}
            </h2>

            <div className="flex items-center justify-center gap-4 mb-6">
                {fields.map((field, index) => (
                    <React.Fragment key={field.name}>
                        {/* Field Input */}
                        <div className="text-center">
                            <Input
                                value={field.value.toString()}
                                onChange={field.onChange}
                                maxLength={field.maxLength}
                                disabled={disabled}
                                aria-label={field.label}
                                className="w-20"
                                placeholder={field.placeholder}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {field.label}
                            </div>
                        </div>

                        {/* Add operation symbol between fields (except after last field) */}
                        {index < fields.length - 1 && (
                            <div className="text-3xl font-bold text-gray-600 mt-6">
                                {config.symbol}
                            </div>
                        )}
                    </React.Fragment>
                ))}

                {/* Equals sign and result preview */}
                <div className="text-3xl font-bold text-gray-600 mt-6">=</div>
                <div className="text-center">
                    <div className="w-20 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mt-6">
                        <span className="text-gray-400">?</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {config.resultLabel}
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-3">
                <Button
                    variant="primary"
                    onClick={onStartProblem}
                    disabled={!isValid || disabled}
                    aria-label={`Start the ${operation} problem`}
                >
                    Start Problem
                </Button>

                <Button
                    variant="secondary"
                    onClick={onGenerate}
                    disabled={disabled}
                    aria-label={`Generate a random ${operation} problem`}
                >
                    Generate Random
                </Button>

                {onReset && (
                    <Button
                        variant="neutral"
                        onClick={onReset}
                        disabled={disabled}
                        aria-label="Reset to default problem"
                    >
                        Reset
                    </Button>
                )}
            </div>

            {/* Problem Preview */}
            {isValid && previewText && (
                <div className="mt-4 text-center">
                    <div className="inline-block bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="font-mono text-lg">
                            {previewText}
                        </span>
                    </div>
                </div>
            )}

            {/* Validation Messages */}
            {validationMessages.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800 text-sm">
                        <strong>Please fix the following:</strong>
                        <ul className="mt-1 list-disc list-inside">
                            {validationMessages.map((message, index) => (
                                <li key={index}>{message}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemInput; 