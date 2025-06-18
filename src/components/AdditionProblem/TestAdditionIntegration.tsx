import React, { useState } from 'react';
import { ProblemInput, ValidationFeedback } from '../Shared';
import type { ProblemField, ValidationResult } from '../Shared';

const TestAdditionIntegration: React.FC = () => {
    const [addend1, setAddend1] = useState<number>(23);
    const [addend2, setAddend2] = useState<number>(45);
    const [showHint, setShowHint] = useState<boolean>(false);

    // Create fields for the ProblemInput component
    const fields: ProblemField[] = [
        {
            name: 'addend1',
            label: 'First number',
            maxLength: 4,
            value: addend1,
            onChange: (value: string) => setAddend1(parseInt(value) || 0),
        },
        {
            name: 'addend2',
            label: 'Second number',
            maxLength: 4,
            value: addend2,
            onChange: (value: string) => setAddend2(parseInt(value) || 0),
        }
    ];

    // Validate the current problem
    const isValidAddend1 = addend1 > 0 && addend1 <= 9999;
    const isValidAddend2 = addend2 > 0 && addend2 <= 9999;
    const isValid = isValidAddend1 && isValidAddend2;

    // Create validation messages
    const validationMessages: string[] = [];
    if (!isValidAddend1) {
        validationMessages.push('First number must be between 1 and 9999');
    }
    if (!isValidAddend2) {
        validationMessages.push('Second number must be between 1 and 9999');
    }

    // Create preview text
    const previewText = isValid ? `${addend1} + ${addend2} = ?` : '';

    // Create validation result for feedback component
    const validationResult: ValidationResult = {
        isValid: isValid,
        message: isValid
            ? '✅ Addition problem is ready!'
            : '❌ Please fix the validation errors above',
        hint: isValid
            ? 'Remember to add from right to left, carrying when needed'
            : 'Make sure both numbers are valid for addition',
        severity: isValid ? 'success' : 'error'
    };

    const handleStartProblem = () => {
        console.log('Starting addition problem:', { addend1, addend2 });
    };

    const handleGenerate = () => {
        // Generate a random addition problem
        const newAddend1 = Math.floor(Math.random() * 900) + 10; // 10-909
        const newAddend2 = Math.floor(Math.random() * 900) + 10; // 10-909

        setAddend1(newAddend1);
        setAddend2(newAddend2);
    };

    const handleReset = () => {
        setAddend1(23);
        setAddend2(45);
    };

    return (
        <div className="test-addition-integration p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                🧪 Shared Components Test - Addition
            </h1>

            <ProblemInput
                operation="addition"
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
                        addend1,
                        addend2,
                        sum: addend1 + addend2,
                        isValid,
                        validationMessages
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default TestAdditionIntegration; 