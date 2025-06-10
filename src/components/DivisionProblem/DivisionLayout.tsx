import React from 'react';
import type { DivisionLayoutProps, FocusPosition, UserInput } from '../../types/division';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import InputField from './InputField';

const DivisionLayout: React.FC<DivisionLayoutProps> = ({
    state,
    onStepComplete: _onStepComplete,
    onInputChange: _onInputChange,
    onFocusChange: _onFocusChange,
}) => {
    const { problem } = state;
    const { divisor, dividend } = problem;
    const { workingArea: _workingArea, currentStep: _currentStep } = state;

    const dividendStr = dividend.toString();
    const quotientLength = Math.ceil(Math.log10(dividend / divisor + 1));

    const {
        currentFocus,
        handleKeyDown,
        focusField
    } = useKeyboardNavigation(state.totalSteps, quotientLength);

    // Helper function to check if a field has an error
    const hasError = (position: FocusPosition): boolean => {
        return state.errors.some(error =>
            error.stepNumber === position.stepNumber &&
            error.fieldType === position.fieldType &&
            error.position === position.position
        );
    };

    // Helper function to check if a field is correct
    const isCorrect = (position: FocusPosition): boolean => {
        const input = state.userInputs.find(input =>
            input.stepNumber === position.stepNumber &&
            input.fieldType === position.fieldType &&
            input.position === position.position
        );
        return input !== undefined && !hasError(position);
    };

    // Helper function to check if field is currently focused
    const isActive = (position: FocusPosition): boolean => {
        return currentFocus.stepNumber === position.stepNumber &&
            currentFocus.fieldType === position.fieldType &&
            currentFocus.position === position.position;
    };

    // Handle input changes
    const handleInputChange = (position: FocusPosition, value: number) => {
        const userInput: UserInput = {
            stepNumber: position.stepNumber,
            fieldType: position.fieldType,
            position: position.position,
            value,
            timestamp: new Date(),
        };

        _onInputChange(userInput);
    };

    // Get user-friendly step description
    const getCurrentStepDescription = () => {
        if (!currentFocus) return 'Start with the first quotient digit';

        switch (currentFocus.fieldType) {
            case 'quotient':
                return `Enter quotient digit ${currentFocus.position + 1}: How many times does ${divisor} go into the current dividend?`;
            case 'multiply':
                return `Multiply: ${divisor} × (quotient digit) = ?`;
            case 'subtract':
                return `Subtract: What's left after subtracting the multiplication result?`;
            case 'bringDown':
                return `Bring down the next digit from ${dividend}`;
            default:
                return 'Continue with the next step';
        }
    };

    return (
        <div className="division-layout font-mono text-lg p-8 bg-white rounded-xl border-2 border-gray-200">
            {/* Division Problem Header */}
            <div className="text-center mb-6">
                <div className="text-2xl text-gray-600 mb-2">
                    {dividend} ÷ {divisor}
                </div>
                {state.isComplete && (
                    <div className="text-green-600 font-semibold">
                        ✅ Problem Complete!
                    </div>
                )}
            </div>

            {/* Current Step Instruction */}
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                        {state.isComplete ? 'All done!' : 'Next Step:'}
                    </div>
                    <div className="text-blue-700">
                        {state.isComplete ? 'Great job completing the division!' : getCurrentStepDescription()}
                    </div>
                </div>
            </div>

            {/* Long Division Visual Layout */}
            <div className="flex justify-center">
                <div className="division-workspace">

                    {/* Quotient Row */}
                    <div className="flex items-center mb-4">
                        <div className="w-20 text-right mr-4 text-xl font-semibold">{divisor}</div>
                        <div className="border-l-2 border-t-2 border-gray-800 p-2 pl-4 min-w-48">
                            {/* Quotient digits */}
                            <div className="flex gap-1 mb-2">
                                {state.quotientDigits.map((digit, index) => {
                                    const position: FocusPosition = {
                                        stepNumber: 0,
                                        fieldType: 'quotient',
                                        position: index,
                                    };

                                    return (
                                        <InputField
                                            key={`quotient-${index}`}
                                            value={digit}
                                            position={position}
                                            isActive={isActive(position)}
                                            isCorrect={isCorrect(position)}
                                            isError={hasError(position)}
                                            placeholder="?"
                                            onChange={(value) => handleInputChange(position, value)}
                                            onFocus={() => {
                                                _onFocusChange(position);
                                                focusField(position);
                                            }}
                                            onBlur={() => { }}
                                            onKeyDown={handleKeyDown}
                                        />
                                    );
                                })}
                            </div>

                            {/* Dividend */}
                            <div className="flex gap-1 text-center">
                                {dividendStr.split('').map((digit, index) => (
                                    <div
                                        key={`dividend-${index}`}
                                        className="w-12 h-10 flex items-center justify-center text-xl border-b-2 border-gray-600"
                                    >
                                        {digit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Working Area - Simplified for clarity */}
                    <div className="ml-24 space-y-4">
                        {/* First step working area */}
                        <div className="step-workspace border-l-2 border-gray-300 pl-4">
                            <div className="text-sm font-medium text-gray-700 mb-3">Working Area:</div>

                            {/* Multiplication result input */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-sm text-gray-600 w-32">Multiply result:</span>
                                <InputField
                                    value={state.workingArea.multiplyResults[0] || null}
                                    position={{
                                        stepNumber: 0,
                                        fieldType: 'multiply',
                                        position: 0,
                                    }}
                                    isActive={isActive({
                                        stepNumber: 0,
                                        fieldType: 'multiply',
                                        position: 0,
                                    })}
                                    isCorrect={isCorrect({
                                        stepNumber: 0,
                                        fieldType: 'multiply',
                                        position: 0,
                                    })}
                                    isError={hasError({
                                        stepNumber: 0,
                                        fieldType: 'multiply',
                                        position: 0,
                                    })}
                                    placeholder="?"
                                    onChange={(value) => handleInputChange({
                                        stepNumber: 0,
                                        fieldType: 'multiply',
                                        position: 0,
                                    }, value)}
                                    onFocus={() => {
                                        const pos = { stepNumber: 0, fieldType: 'multiply' as const, position: 0 };
                                        _onFocusChange(pos);
                                        focusField(pos);
                                    }}
                                    onBlur={() => { }}
                                    onKeyDown={handleKeyDown}
                                />
                                <span className="text-sm text-gray-500">({divisor} × quotient digit)</span>
                            </div>

                            {/* Subtraction line */}
                            <div className="border-b border-gray-400 ml-32 mr-8 mb-2"></div>

                            {/* Subtraction result input */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-sm text-gray-600 w-32">Subtract result:</span>
                                <InputField
                                    value={state.workingArea.subtractResults[0] || null}
                                    position={{
                                        stepNumber: 0,
                                        fieldType: 'subtract',
                                        position: 0,
                                    }}
                                    isActive={isActive({
                                        stepNumber: 0,
                                        fieldType: 'subtract',
                                        position: 0,
                                    })}
                                    isCorrect={isCorrect({
                                        stepNumber: 0,
                                        fieldType: 'subtract',
                                        position: 0,
                                    })}
                                    isError={hasError({
                                        stepNumber: 0,
                                        fieldType: 'subtract',
                                        position: 0,
                                    })}
                                    placeholder="?"
                                    onChange={(value) => handleInputChange({
                                        stepNumber: 0,
                                        fieldType: 'subtract',
                                        position: 0,
                                    }, value)}
                                    onFocus={() => {
                                        const pos = { stepNumber: 0, fieldType: 'subtract' as const, position: 0 };
                                        _onFocusChange(pos);
                                        focusField(pos);
                                    }}
                                    onBlur={() => { }}
                                    onKeyDown={handleKeyDown}
                                />
                                <span className="text-sm text-gray-500">(dividend portion - multiply result)</span>
                            </div>

                            {/* Bring down next digit */}
                            {dividendStr.length > 1 && (
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm text-gray-600 w-32">Bring down:</span>
                                    <div className="w-12 h-10 flex items-center justify-center text-lg border-2 border-dashed border-blue-300 rounded bg-blue-50">
                                        {dividendStr[1]}
                                    </div>
                                    <span className="text-sm text-gray-500">(next digit from {dividend})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Helpful Tips */}
            <div className="mt-6 text-center text-sm text-gray-500">
                💡 <strong>Tip:</strong> Use your numpad to type numbers, Tab to move forward, Shift+Tab to go back
            </div>
        </div>
    );
};

export default DivisionLayout; 