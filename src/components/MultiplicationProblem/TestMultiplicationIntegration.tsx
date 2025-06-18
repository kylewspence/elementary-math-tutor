import React, { useState } from 'react';
import { ProblemInput, ValidationFeedback } from '../Shared';
import type { ProblemField, ValidationResult } from '../Shared';

const TestMultiplicationIntegration: React.FC = () => {
    const [multiplicand, setMultiplicand] = useState<number>(23);
    const [multiplier, setMultiplier] = useState<number>(45);
    const [showHint, setShowHint] = useState<boolean>(false);

    // Create fields for the ProblemInput component
    const fields: ProblemField[] = [
        {
            name: 'multiplicand',
            label: 'Number to multiply',
            maxLength: 4,
            value: multiplicand,
            onChange: (value: string) => setMultiplicand(parseInt(value) || 0),
        },
        {
            name: 'multiplier',
            label: 'Multiply by',
            maxLength: 3,
            value: multiplier,
            onChange: (value: string) => setMultiplier(parseInt(value) || 0),
        }
    ];

    // Validate the current problem
    const isValidMultiplicand = multiplicand > 0 && multiplicand <= 9999;
    const isValidMultiplier = multiplier > 0 && multiplier <= 999;
    const isValid = isValidMultiplicand && isValidMultiplier;

    // Create validation messages
    const validationMessages: string[] = [];
    if (!isValidMultiplicand) {
        validationMessages.push('Multiplicand must be between 1 and 9999');
    }
    if (!isValidMultiplier) {
        validationMessages.push('Multiplier must be between 1 and 999');
    }

    // Create preview text
    const previewText = isValid ? `${multiplicand} × ${multiplier} = ?` : '';

    // Create validation result for feedback component
    const validationResult: ValidationResult = {
        isValid: isValid,
        message: isValid
            ? '✅ Multiplication problem is ready!'
            : '❌ Please fix the validation errors above',
        hint: isValid
            ? 'Remember to calculate partial products first, then add them together'
            : 'Make sure both numbers are valid for multiplication',
        severity: isValid ? 'success' : 'error'
    };

    const handleStartProblem = () => {
        console.log('Starting multiplication problem:', { multiplicand, multiplier });
    };

    const handleGenerate = () => {
        // Generate a random multiplication problem
        const newMultiplicand = Math.floor(Math.random() * 90) + 10; // 10-99
        const newMultiplier = Math.floor(Math.random() * 90) + 10; // 10-99

        setMultiplicand(newMultiplicand);
        setMultiplier(newMultiplier);
    };

    const handleReset = () => {
        setMultiplicand(23);
        setMultiplier(45);
    };

    return (
        <div className="test-multiplication-integration p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                🧪 Shared Components Test - Multiplication
            </h1>

            <ProblemInput
                operation="multiplication"
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
                        multiplicand,
                        multiplier,
                        product: multiplicand * multiplier,
                        isValid,
                        validationMessages
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default TestMultiplicationIntegration; 