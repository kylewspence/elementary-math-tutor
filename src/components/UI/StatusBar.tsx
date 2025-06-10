import React from 'react';
import type { DivisionState } from '../../types/division';

interface StatusBarProps {
    state: DivisionState;
}

const StatusBar: React.FC<StatusBarProps> = ({ state }) => {
    const { isComplete, currentStep, totalSteps } = state;

    // Calculate progress percentage
    const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

    if (isComplete) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                    <div className="text-green-700 font-semibold flex items-center gap-2">
                        <span className="text-2xl">🎉</span>
                        <span>Congratulations! You completed the division problem!</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                {/* Progress indicator */}
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700">
                        Progress: {Math.max(1, currentStep + 1)} of {totalSteps} steps
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(10, progress)}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-600">{progress}%</span>
                </div>

                {/* Encouragement */}
                <div className="text-sm text-gray-600">
                    {progress < 25 && "Getting started! 🚀"}
                    {progress >= 25 && progress < 50 && "Making progress! 📈"}
                    {progress >= 50 && progress < 75 && "Halfway there! 💪"}
                    {progress >= 75 && progress < 100 && "Almost done! ⭐"}
                </div>
            </div>
        </div>
    );
};

export default StatusBar; 