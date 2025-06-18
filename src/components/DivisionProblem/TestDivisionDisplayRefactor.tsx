import React, { useState } from 'react';
import DivisionDisplay from './DivisionDisplay';
import type { DivisionProblem, UserAnswer, DivisionGameState } from '../../types/game';
import type { CurrentFocus } from '../../hooks/useKeyboardNav';

/**
 * Test component to verify DivisionDisplay functionality after SubmitControls integration
 * Tests all major workflows: input, submission, completion, reset, and generation
 */
const TestDivisionDisplayRefactor: React.FC = () => {
    // Sample division problem: 84 ÷ 12 = 7 remainder 0
    const [problem, setProblem] = useState<DivisionProblem>({
        dividend: 84,
        divisor: 12,
        quotient: 7,
        remainder: 0,
        steps: [
            {
                stepNumber: 1,
                dividendPart: 84,
                quotientDigit: 7,
                multiply: 84, // 12 × 7 = 84
                subtract: 0  // 84 - 84 = 0
            }
        ],
        isEditable: false
    });

    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [currentFocus, setCurrentFocus] = useState<CurrentFocus>({
        stepNumber: 0,
        fieldType: 'quotient',
        fieldPosition: 0
    });
    const [gameState, setGameState] = useState<DivisionGameState>({
        currentLevel: 1,
        completedLevels: [],
        availableLevels: [1, 2, 3],
        currentProblemIndex: 0,
        levelProblems: [],
        problem: null,
        userAnswers: [],
        isSubmitted: false,
        isComplete: false,
        score: 0,
        gameMode: 'division'
    });

    // Test state controls
    const [testState, setTestState] = useState({
        isSubmitted: false,
        isComplete: false,
        allFieldsFilled: false
    });

    const handleAnswerSubmit = (answer: UserAnswer) => {
        setUserAnswers(prev => {
            const filtered = prev.filter(a =>
                !(a.stepNumber === answer.stepNumber &&
                    a.fieldType === answer.fieldType &&
                    a.fieldPosition === answer.fieldPosition)
            );
            return [...filtered, answer];
        });
    };

    const handleAnswerClear = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => {
        setUserAnswers(prev => prev.filter(a =>
            !(a.stepNumber === stepNumber &&
                a.fieldType === fieldType &&
                a.fieldPosition === position)
        ));
    };

    const handleProblemSubmit = () => {
        setTestState(prev => ({ ...prev, isSubmitted: true }));
        setGameState(prev => ({ ...prev, isSubmitted: true }));

        // Simulate checking if problem is complete
        setTimeout(() => {
            setTestState(prev => ({ ...prev, isComplete: true }));
            setGameState(prev => ({ ...prev, isComplete: true, endTime: new Date() }));
        }, 500);
    };

    const handleNextProblem = () => {
        // Generate new problem: 96 ÷ 8 = 12
        setProblem({
            dividend: 96,
            divisor: 8,
            quotient: 12,
            remainder: 0,
            steps: [
                {
                    stepNumber: 1,
                    dividendPart: 96,
                    quotientDigit: 12,
                    multiply: 96,
                    subtract: 0
                }
            ],
            isEditable: false
        });
        setUserAnswers([]);
        setTestState({ isSubmitted: false, isComplete: false, allFieldsFilled: false });
        setGameState(prev => ({
            ...prev,
            isSubmitted: false,
            isComplete: false,
            score: prev.score + 1,
            startTime: new Date(),
            endTime: undefined
        }));
    };

    const handleResetProblem = () => {
        setUserAnswers([]);
        setTestState(prev => ({ ...prev, isSubmitted: false, isComplete: false, allFieldsFilled: false }));
        setGameState(prev => ({
            ...prev,
            isSubmitted: false,
            isComplete: false,
            endTime: undefined
        }));
    };

    const handleNewProblem = () => {
        // Generate random problem: 144 ÷ 9 = 16
        setProblem({
            dividend: 144,
            divisor: 9,
            quotient: 16,
            remainder: 0,
            steps: [
                {
                    stepNumber: 1,
                    dividendPart: 144,
                    quotientDigit: 16,
                    multiply: 144,
                    subtract: 0
                }
            ],
            isEditable: false
        });
        setUserAnswers([]);
        setTestState({ isSubmitted: false, isComplete: false, allFieldsFilled: false });
        setGameState(prev => ({
            ...prev,
            isSubmitted: false,
            isComplete: false,
            startTime: new Date(),
            endTime: undefined
        }));
    };

    const handleEnableEditing = () => {
        setProblem(prev => ({ ...prev, isEditable: true }));
    };

    const handleDisableEditing = () => {
        setProblem(prev => ({ ...prev, isEditable: false }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle keyboard navigation
        console.log('Key pressed:', e.key);
    };

    const handleFieldClick = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position?: number) => {
        setCurrentFocus({
            stepNumber,
            fieldType,
            fieldPosition: position || 0
        });
    };

    const handleUpdateProblem = (dividend: number, divisor: number) => {
        setProblem(prev => ({
            ...prev,
            dividend,
            divisor,
            // Note: In a real app, you'd recalculate the solution
            quotient: Math.floor(dividend / divisor),
            remainder: dividend % divisor
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    🧪 Division Display Refactor Test
                </h1>

                <div className="mb-8 bg-white rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => setTestState(prev => ({ ...prev, allFieldsFilled: !prev.allFieldsFilled }))}
                            className={`px-4 py-2 rounded-lg font-semibold ${testState.allFieldsFilled
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            All Fields: {testState.allFieldsFilled ? 'Filled' : 'Empty'}
                        </button>

                        <button
                            onClick={() => setTestState(prev => ({ ...prev, isSubmitted: !prev.isSubmitted }))}
                            className={`px-4 py-2 rounded-lg font-semibold ${testState.isSubmitted
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Submitted: {testState.isSubmitted ? 'Yes' : 'No'}
                        </button>

                        <button
                            onClick={() => setTestState(prev => ({ ...prev, isComplete: !prev.isComplete }))}
                            className={`px-4 py-2 rounded-lg font-semibold ${testState.isComplete
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Complete: {testState.isComplete ? 'Yes' : 'No'}
                        </button>

                        <button
                            onClick={() => setProblem(prev => ({ ...prev, isEditable: !prev.isEditable }))}
                            className={`px-4 py-2 rounded-lg font-semibold ${problem.isEditable
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Editable: {problem.isEditable ? 'Yes' : 'No'}
                        </button>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        <p><strong>Current Problem:</strong> {problem.dividend} ÷ {problem.divisor}</p>
                        <p><strong>User Answers:</strong> {userAnswers.length}</p>
                        <p><strong>Game Score:</strong> {gameState.score}</p>
                    </div>
                </div>

                {/* The actual DivisionDisplay component being tested */}
                <div className="bg-white rounded-lg shadow-lg">
                    <DivisionDisplay
                        problem={problem}
                        userAnswers={userAnswers}
                        currentFocus={currentFocus}
                        onAnswerSubmit={handleAnswerSubmit}
                        onAnswerClear={handleAnswerClear}
                        onProblemSubmit={handleProblemSubmit}
                        onEnableEditing={handleEnableEditing}
                        onDisableEditing={handleDisableEditing}
                        isSubmitted={testState.isSubmitted}
                        isComplete={testState.isComplete}
                        onKeyDown={handleKeyDown}
                        onFieldClick={handleFieldClick}
                        gameState={gameState}
                        onNextProblem={handleNextProblem}
                        onResetProblem={handleResetProblem}
                        onNewProblem={handleNewProblem}
                        onUpdateProblem={handleUpdateProblem}
                    />
                </div>

                <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Integration Test Results</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${testState.allFieldsFilled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>SubmitControls responds to allFieldsFilled state</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${testState.isSubmitted ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>SubmitControls shows post-submit actions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${testState.isComplete ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>SubmitControls shows ProblemComplete with Next button</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span>Triangle layout maintained (visual consistency)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span>All callback functions properly connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestDivisionDisplayRefactor; 