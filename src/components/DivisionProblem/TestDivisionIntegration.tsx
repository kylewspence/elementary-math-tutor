import React, { useState } from 'react';
import { ProblemInput, ValidationFeedback } from '../Shared';
import type { ProblemField, ValidationResult } from '../Shared';

import { validateDivisor, validateDividend } from '../../utils/validation';

const TestDivisionIntegration: React.FC = () => {
    const [dividend, setDividend] = useState<number>(84);
    const [divisor, setDivisor] = useState<number>(12);
    const [showHint, setShowHint] = useState<boolean>(false);

    // Create fields for the ProblemInput component
    const fields: ProblemField[] = [
        {
            name: 'dividend',
            label: 'Number being divided',
            maxLength: 4,
            value: dividend,
            onChange: (value: string) => setDividend(parseInt(value) || 0),
        },
        {
            name: 'divisor',
            label: 'Number to divide by',
            maxLength: 3,
            value: divisor,
            onChange: (value: string) => setDivisor(parseInt(value) || 0),
        }
    ];

    // Validate the current problem
    const divisorValidation = validateDivisor(divisor);
    const dividendValidation = validateDividend(dividend);
    const isValid = divisorValidation.isValid && dividendValidation.isValid;

    // Create validation messages
    const validationMessages: string[] = [];
    if (!divisorValidation.isValid && divisorValidation.error) {
        validationMessages.push(divisorValidation.error);
    }
    if (!dividendValidation.isValid && dividendValidation.error) {
        validationMessages.push(dividendValidation.error);
    }

    // Create preview text
    const previewText = isValid ? `${dividend} ÷ ${divisor} = ?` : '';

    // Create validation result for feedback component
    const validationResult: ValidationResult = {
        isValid: isValid,
        message: isValid
            ? '✅ Problem is ready to start!'
            : '❌ Please fix the validation errors above',
        hint: isValid
            ? 'Remember to work step by step: quotient, multiply, subtract, bring down'
            : 'Make sure both numbers are valid for division',
        severity: isValid ? 'success' : 'error'
    };

    const handleStartProblem = () => {
        console.log('Starting division problem:', { dividend, divisor });
        // In real implementation, this would start the actual division problem
    };

    const handleGenerate = () => {
        // Generate a random division problem
        const newDivisor = Math.floor(Math.random() * 9) + 2; // 2-10
        const quotient = Math.floor(Math.random() * 9) + 1; // 1-9
        const newDividend = newDivisor * quotient;

        setDivisor(newDivisor);
        setDividend(newDividend);
    };

    const handleReset = () => {
        setDividend(84);
        setDivisor(12);
    };

    return (
        <div className="test-division-integration p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                🧪 Shared Components Test - Division
            </h1>

            <ProblemInput
                operation="division"
                fields={fields}
                onStartProblem={handleStartProblem}
                onGenerate={handleGenerate}
                onReset={handleReset}
                disabled={false}
                isValid={isValid}
                previewText={previewText}
                validationMessages={validationMessages}
            />

            <ValidationFeedback
                validation={validationResult}
                showHint={showHint}
                onHintToggle={() => setShowHint(!showHint)}
            />

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <pre className="text-sm text-gray-700">
                    {JSON.stringify({
                        dividend,
                        divisor,
                        isValid,
                        divisorValidation,
                        dividendValidation,
                        validationMessages
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default TestDivisionIntegration; 