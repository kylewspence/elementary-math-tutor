import React, { useState, useCallback } from 'react';
import SubtractionDisplay from './SubtractionDisplay';
import type { SubtractionProblem, SubtractionUserAnswer } from '../../types/subtraction';
import { generateSubtractionProblem } from '../../utils/subtractionGenerator';
import { validateSubtractionAnswer, areAllSubtractionFieldsFilled } from '../../utils/subtractionValidator';
import { SUBTRACTION_LEVELS } from '../../utils/constants';

// Temporary type definition for testing
interface SubtractionCurrentFocus {
    columnPosition: number;
    fieldType: 'difference' | 'borrow' | 'adjusted';
}

/**
 * Test component for SubtractionDisplay to verify user input handling
 */
const SubtractionDisplayTest: React.FC = () => {
    // Generate a test problem with borrowing
    const [problem] = useState<SubtractionProblem>(() => generateSubtractionProblem(SUBTRACTION_LEVELS[2]));
    const [userAnswers, setUserAnswers] = useState<SubtractionUserAnswer[]>([]);
    const [currentFocus, setCurrentFocus] = useState<SubtractionCurrentFocus>({
        columnPosition: 0,
        fieldType: 'difference'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Handle answer submission
    const handleAnswerSubmit = useCallback((answer: SubtractionUserAnswer) => {
        console.log('Answer submitted:', answer);

        // Validate the answer
        const isCorrect = validateSubtractionAnswer(problem, answer);
        const validatedAnswer = { ...answer, isCorrect };

        // Update or add the answer
        setUserAnswers(prev => {
            const existingIndex = prev.findIndex(
                a => a.columnPosition === answer.columnPosition && a.fieldType === answer.fieldType
            );

            if (existingIndex >= 0) {
                // Update existing answer
                const updated = [...prev];
                updated[existingIndex] = validatedAnswer;
                return updated;
            } else {
                // Add new answer
                return [...prev, validatedAnswer];
            }
        });
    }, [problem]);

    // Handle answer clearing
    const handleAnswerClear = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow' | 'adjusted') => {
        console.log('Answer cleared:', { columnPosition, fieldType });

        setUserAnswers(prev =>
            prev.filter(a => !(a.columnPosition === columnPosition && a.fieldType === fieldType))
        );
    }, []);

    // Handle field click
    const handleFieldClick = useCallback((columnPosition: number, fieldType: 'difference' | 'borrow' | 'adjusted') => {
        console.log('Field clicked:', { columnPosition, fieldType });
        setCurrentFocus({ columnPosition, fieldType });
    }, []);

    // Handle keyboard navigation (simplified for testing)
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        console.log('Key pressed:', e.key);
        // Basic keyboard handling for testing
        if (e.key === 'Tab') {
            e.preventDefault();
            // Simple tab navigation for testing
        }
    }, []);

    // Handle problem submission
    const handleProblemSubmit = useCallback(() => {
        console.log('Problem submitted');
        setIsSubmitted(true);

        // Check if all fields are filled and correct
        const allFieldsFilled = areAllSubtractionFieldsFilled(problem, userAnswers);
        const allCorrect = userAnswers.every(answer => answer.isCorrect === true);

        setIsComplete(allFieldsFilled && allCorrect);

        console.log('All fields filled:', allFieldsFilled);
        console.log('All correct:', allCorrect);
        console.log('Problem complete:', allFieldsFilled && allCorrect);
    }, [userAnswers, problem]);

    // Handle next problem
    const handleNextProblem = useCallback(() => {
        console.log('Next problem requested');
        // Reset for new problem
        setUserAnswers([]);
        setIsSubmitted(false);
        setIsComplete(false);
        setCurrentFocus({ columnPosition: 0, fieldType: 'difference' });
    }, []);

    // Check if all fields are filled
    const areAllFieldsFilled = useCallback(() => {
        return areAllSubtractionFieldsFilled(problem, userAnswers);
    }, [userAnswers, problem]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Subtraction Display Test</h1>

                {/* Test Info Panel */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-blue-200">
                    <h2 className="text-xl font-semibold mb-4">Test Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-gray-700">Problem:</h3>
                            <p>{problem.minuend} − {problem.subtrahend} = {problem.difference}</p>
                            <p className="text-gray-600">Needs borrowing: {problem.steps.some(s => s.needsBorrow) ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700">Current State:</h3>
                            <p>Answers: {userAnswers.length}</p>
                            <p>All filled: {areAllFieldsFilled() ? 'Yes' : 'No'}</p>
                            <p>Submitted: {isSubmitted ? 'Yes' : 'No'}</p>
                            <p>Complete: {isComplete ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                {/* Debug Panel */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gray-200">
                    <h3 className="font-semibold mb-2">Debug Info:</h3>
                    <div className="text-xs">
                        <p><strong>Current Focus:</strong> Column {currentFocus.columnPosition}, Field {currentFocus.fieldType}</p>
                        <p><strong>User Answers:</strong></p>
                        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(userAnswers, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* The actual component being tested */}
                <SubtractionDisplay
                    problem={problem}
                    userAnswers={userAnswers}
                    currentFocus={currentFocus}
                    onAnswerSubmit={handleAnswerSubmit}
                    onAnswerClear={handleAnswerClear}
                    onProblemSubmit={handleProblemSubmit}
                    onKeyDown={handleKeyDown}
                    onFieldClick={handleFieldClick}
                    onNextProblem={handleNextProblem}
                    isSubmitted={isSubmitted}
                    isComplete={isComplete}
                    areAllFieldsFilled={areAllFieldsFilled}
                />

                {/* Test Controls */}
                <div className="bg-white rounded-lg p-4 mt-6 border-2 border-green-200">
                    <h3 className="font-semibold mb-4">Test Controls</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setUserAnswers([])}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Clear All Answers
                        </button>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                            Reset Submission
                        </button>
                        <button
                            onClick={() => {
                                console.log('Problem steps:', problem.steps);
                                console.log('Required fields calculation test...');
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Log Problem Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubtractionDisplayTest; 