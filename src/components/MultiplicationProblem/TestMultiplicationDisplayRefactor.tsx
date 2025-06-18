import React, { useState, useEffect } from 'react';
import MultiplicationDisplay from './MultiplicationDisplay';
import type { MultiplicationProblem, MultiplicationCurrentFocus, MultiplicationUserAnswer } from '../../types/multiplication';

/**
 * Test component for verifying MultiplicationDisplay refactor
 * This component provides interactive controls to test all aspects of the refactored component
 */
const TestMultiplicationDisplayRefactor: React.FC = () => {
    // Test problem: 23 × 4 = 92
    const [problem] = useState<MultiplicationProblem>({
        id: 'test-23x4',
        multiplicand: 23,
        multiplier: 4,
        product: 92,
        partialProducts: [], // Single digit multiplier, no partial products needed
        isEditable: false,
        difficulty: 'easy'
    });

    const [userAnswers, setUserAnswers] = useState<MultiplicationUserAnswer[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentFocus, setCurrentFocus] = useState<MultiplicationCurrentFocus>({
        fieldType: 'product',
        fieldPosition: 0,
        partialIndex: undefined
    });

    // Test controls
    const [testControls, setTestControls] = useState({
        allFieldsFilled: false,
        isComplete: false,
        enableCallbackLogs: true
    });

    // Auto-calculate if test is complete based on problem
    useEffect(() => {
        if (problem) {
            const productStr = problem.product.toString();
            const expectedAnswers = productStr.length; // Number of product digits

            // Check if we have answers for all product positions
            const productAnswers = userAnswers.filter(a => a.fieldType === 'product');
            const hasAllProductAnswers = productAnswers.length >= expectedAnswers;

            // For this simple test, assume all answers are correct if they exist
            const allCorrect = productAnswers.every(a => {
                const expectedValue = parseInt(productStr[productStr.length - 1 - a.fieldPosition], 10);
                return a.value === expectedValue;
            });

            setTestControls(prev => ({
                ...prev,
                allFieldsFilled: hasAllProductAnswers,
                isComplete: hasAllProductAnswers && allCorrect && isSubmitted
            }));
        }
    }, [userAnswers, isSubmitted, problem]);

    // Callback handlers with logging
    const logCallback = (action: string, ...args: unknown[]) => {
        if (testControls.enableCallbackLogs) {
            console.log(`[MultiplicationDisplay Test] ${action}:`, ...args);
        }
    };

    const handleAnswerSubmit = (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        logCallback('Answer Submit', { value, fieldType, position, partialIndex });

        // Calculate if this answer is correct
        let isCorrect = false;
        if (fieldType === 'product' && problem) {
            const productStr = problem.product.toString();
            const expectedValue = parseInt(productStr[productStr.length - 1 - position], 10);
            isCorrect = value === expectedValue;
        }

        setUserAnswers(prev => {
            // Remove any existing answer for this position
            const filtered = prev.filter(a =>
                !(a.fieldType === fieldType && a.fieldPosition === position && a.partialIndex === partialIndex)
            );

            // Add the new answer
            return [...filtered, {
                fieldType,
                fieldPosition: position,
                partialIndex,
                value,
                isCorrect,
                timestamp: new Date()
            }];
        });
    };

    const handleAnswerClear = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        logCallback('Answer Clear', { fieldType, position, partialIndex });
        setUserAnswers(prev => prev.filter(a =>
            !(a.fieldType === fieldType && a.fieldPosition === position && a.partialIndex === partialIndex)
        ));
    };

    const handleProblemSubmit = () => {
        logCallback('Problem Submit');
        setIsSubmitted(true);
    };

    const handleResetProblem = () => {
        logCallback('Reset Problem');
        setUserAnswers([]);
        setIsSubmitted(false);
    };

    const handleNewProblem = () => {
        logCallback('New Problem');
        setUserAnswers([]);
        setIsSubmitted(false);
    };

    const handleNextProblem = () => {
        logCallback('Next Problem');
        // In a real app, this would navigate to the next problem
        handleNewProblem();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        logCallback('Key Down', e.key);
        // Basic navigation logic for testing
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            // Move to next field (simplified)
            if (currentFocus.fieldPosition > 0) {
                setCurrentFocus(prev => ({
                    ...prev,
                    fieldPosition: prev.fieldPosition - 1
                }));
            }
        }
    };

    const handleFieldClick = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        logCallback('Field Click', { fieldType, position, partialIndex });
        setCurrentFocus({ fieldType, fieldPosition: position, partialIndex });
    };

    // Test control functions
    const toggleAllFields = () => {
        if (userAnswers.length === 0) {
            // Fill in correct answers for 23 × 4 = 92
            const correctAnswers: MultiplicationUserAnswer[] = [
                { fieldType: 'product', fieldPosition: 0, value: 2, isCorrect: true, timestamp: new Date() }, // ones place
                { fieldType: 'product', fieldPosition: 1, value: 9, isCorrect: true, timestamp: new Date() }, // tens place
            ];
            setUserAnswers(correctAnswers);
        } else {
            setUserAnswers([]);
        }
    };

    const toggleSubmitted = () => {
        setIsSubmitted(!isSubmitted);
    };

    const toggleComplete = () => {
        setTestControls(prev => ({ ...prev, isComplete: !prev.isComplete }));
    };

    return (
        <div className="test-container p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    MultiplicationDisplay Refactor Test
                </h1>

                {/* Test problem info */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Problem: 23 × 4 = 92</h2>
                    <div className="text-sm text-blue-600">
                        <p>• Product digits: 9 (tens), 2 (ones)</p>
                        <p>• Expected fields: 2 product inputs</p>
                        <p>• Correct answers: position 0 = 2, position 1 = 9</p>
                    </div>
                </div>

                {/* Test Controls */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Controls</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <button
                            onClick={toggleAllFields}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            {userAnswers.length > 0 ? 'Clear All' : 'Fill All'} Fields
                        </button>

                        <button
                            onClick={toggleSubmitted}
                            className={`px-4 py-2 rounded transition-colors ${isSubmitted
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                        >
                            {isSubmitted ? 'Unsubmit' : 'Submit'} Problem
                        </button>

                        <button
                            onClick={toggleComplete}
                            className={`px-4 py-2 rounded transition-colors ${testControls.isComplete
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                                }`}
                        >
                            {testControls.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>

                        <button
                            onClick={() => setTestControls(prev => ({ ...prev, enableCallbackLogs: !prev.enableCallbackLogs }))}
                            className={`px-4 py-2 rounded transition-colors ${testControls.enableCallbackLogs
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                                }`}
                        >
                            {testControls.enableCallbackLogs ? 'Disable' : 'Enable'} Logs
                        </button>
                    </div>

                    {/* Status Display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                        <div className="text-center">
                            <div className="font-semibold text-gray-700">Submitted</div>
                            <div className={`text-lg ${isSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                                {isSubmitted ? '✅ Yes' : '❌ No'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-700">Complete</div>
                            <div className={`text-lg ${testControls.isComplete ? 'text-green-600' : 'text-red-600'}`}>
                                {testControls.isComplete ? '✅ Yes' : '❌ No'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-700">Fields Filled</div>
                            <div className={`text-lg ${testControls.allFieldsFilled ? 'text-green-600' : 'text-red-600'}`}>
                                {testControls.allFieldsFilled ? '✅ Yes' : '❌ No'}
                            </div>
                        </div>
                    </div>

                    {/* User Answers Display */}
                    <div className="mt-4">
                        <h3 className="font-semibold text-gray-700 mb-2">User Answers ({userAnswers.length}):</h3>
                        <div className="text-sm text-gray-600">
                            {userAnswers.length === 0 ? (
                                <p>No answers yet</p>
                            ) : (
                                userAnswers.map((answer, index) => (
                                    <div key={index} className="mb-1">
                                        {answer.fieldType} position {answer.fieldPosition}: {answer.value}
                                        {answer.isCorrect !== undefined && (
                                            <span className={answer.isCorrect ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                                                {answer.isCorrect ? '✅' : '❌'}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* The actual component being tested */}
                <div className="bg-white rounded-lg shadow-lg">
                    <MultiplicationDisplay
                        problem={problem}
                        userAnswers={userAnswers}
                        currentFocus={currentFocus}
                        onAnswerSubmit={handleAnswerSubmit}
                        onAnswerClear={handleAnswerClear}
                        onProblemSubmit={handleProblemSubmit}
                        onResetProblem={handleResetProblem}
                        onNewProblem={handleNewProblem}
                        onNextProblem={handleNextProblem}
                        onKeyDown={handleKeyDown}
                        onFieldClick={handleFieldClick}
                        isSubmitted={isSubmitted}
                        isComplete={testControls.isComplete}
                        setCurrentFocus={(focus) => setCurrentFocus(focus || { fieldType: 'product', fieldPosition: 0, partialIndex: undefined })}
                    />
                </div>

                {/* Notes */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Test Notes:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Check console logs (if enabled) to verify callback execution</li>
                        <li>• Test all button states: enabled/disabled submit, triangle layout</li>
                        <li>• Verify ProblemComplete integration works correctly</li>
                        <li>• Ensure no TypeScript errors in the build process</li>
                        <li>• Test keyboard navigation and input handling</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TestMultiplicationDisplayRefactor; 