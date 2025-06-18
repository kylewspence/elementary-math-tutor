import React, { useState } from 'react';
import { SubmitControls } from './index';
import type { MathOperation } from '../../types/math';

const TestSubmitControlsIntegration: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [allFieldsFilled, setAllFieldsFilled] = useState<boolean>(true);
    const [operation, setOperation] = useState<MathOperation>('division');
    const [variant, setVariant] = useState<'triangle' | 'horizontal' | 'vertical'>('triangle');

    // Mock problem data for each operation
    const mockProblemData = {
        division: {
            dividend: 84,
            divisor: 12,
            quotient: 7,
            remainder: 0
        },
        addition: {
            addend1: 23,
            addend2: 45,
            sum: 68
        },
        multiplication: {
            multiplicand: 23,
            multiplier: 45,
            product: 1035
        }
    };

    const handleSubmit = () => {
        console.log('Submit clicked for', operation);
        setIsSubmitted(true);
        // Simulate validation - mark as complete after submit
        setTimeout(() => {
            setIsComplete(true);
        }, 500);
    };

    const handleNextProblem = () => {
        console.log('Next problem clicked');
        setIsSubmitted(false);
        setIsComplete(false);
    };

    const handleReset = () => {
        console.log('Reset clicked');
        setIsSubmitted(false);
        setIsComplete(false);
    };

    const handleGenerateNew = () => {
        console.log('Generate new clicked');
        setIsSubmitted(false);
        setIsComplete(false);
    };

    return (
        <div className="test-submit-controls max-w-4xl mx-auto p-8 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                SubmitControls Component Test
            </h2>

            {/* Control Panel */}
            <div className="control-panel bg-gray-100 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Test Controls</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Operation Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Operation
                        </label>
                        <select
                            value={operation}
                            onChange={(e) => setOperation(e.target.value as MathOperation)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="division">Division</option>
                            <option value="addition">Addition</option>
                            <option value="multiplication">Multiplication</option>
                        </select>
                    </div>

                    {/* Variant Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Layout Variant
                        </label>
                        <select
                            value={variant}
                            onChange={(e) => setVariant(e.target.value as 'triangle' | 'horizontal' | 'vertical')}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="triangle">Triangle</option>
                            <option value="horizontal">Horizontal</option>
                            <option value="vertical">Vertical</option>
                        </select>
                    </div>

                    {/* State Controls */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            State Controls
                        </label>
                        <div className="space-y-1">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={allFieldsFilled}
                                    onChange={(e) => setAllFieldsFilled(e.target.checked)}
                                    className="mr-2"
                                />
                                All Fields Filled
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isSubmitted}
                                    onChange={(e) => setIsSubmitted(e.target.checked)}
                                    className="mr-2"
                                />
                                Is Submitted
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isComplete}
                                    onChange={(e) => setIsComplete(e.target.checked)}
                                    className="mr-2"
                                />
                                Is Complete
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Component Demo */}
            <div className="demo-area bg-white border border-gray-200 rounded-lg p-8 min-h-[300px] relative">
                <h3 className="text-lg font-semibold mb-4">
                    {operation.charAt(0).toUpperCase() + operation.slice(1)} - {variant} Layout
                </h3>

                <div className="flex items-center justify-center h-48">
                    <SubmitControls
                        isSubmitted={isSubmitted}
                        isComplete={isComplete}
                        allFieldsFilled={allFieldsFilled}
                        onSubmit={handleSubmit}
                        onNextProblem={handleNextProblem}
                        onReset={handleReset}
                        onGenerateNew={handleGenerateNew}
                        operation={operation}
                        variant={variant}
                        problemData={mockProblemData[operation]}
                    />
                </div>
            </div>

            {/* Status Display */}
            <div className="status-display bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Current State</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Operation:</span> {operation}
                    </div>
                    <div>
                        <span className="font-medium">Variant:</span> {variant}
                    </div>
                    <div>
                        <span className="font-medium">Submitted:</span> {isSubmitted ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <span className="font-medium">Complete:</span> {isComplete ? 'Yes' : 'No'}
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="help-section bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h3>
                <div className="text-sm space-y-1">
                    <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> - Submit answers (when ready) or advance to next problem (when complete)</div>
                    <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">R</kbd> - Reset current problem (after submit)</div>
                    <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">G</kbd> - Generate new problem (after submit)</div>
                    <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">N</kbd> - Next problem (when complete)</div>
                </div>
            </div>
        </div>
    );
};

export default TestSubmitControlsIntegration; 