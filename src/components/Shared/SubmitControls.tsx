import React from 'react';

export interface SubmitControlsProps {
    isSubmitted: boolean;
    isComplete: boolean;
    areAllFieldsFilled: () => boolean;
    onProblemSubmit: () => void;
    onNextProblem?: () => void;
}

const SubmitControls: React.FC<SubmitControlsProps> = ({
    isSubmitted,
    isComplete,
    areAllFieldsFilled,
    onProblemSubmit,
    onNextProblem,
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
            <div className="flex flex-col items-center">
                {/* Submit/Next Problem button */}
                {!isSubmitted ? (
                    <button
                        onClick={onProblemSubmit}
                        disabled={!areAllFieldsFilled()}
                        className={`px-6 py-2 rounded-lg font-semibold mb-4 ${!areAllFieldsFilled()
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            } transition-colors`}
                    >
                        <span className="flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Submit Answers
                        </span>
                    </button>
                ) : isComplete ? (
                    <button
                        onClick={() => onNextProblem?.()}
                        className="px-6 py-2 rounded-lg font-semibold mb-4 bg-green-500 text-white hover:bg-green-600 transition-colors"
                        autoFocus
                    >
                        <span className="flex items-center justify-center gap-1">
                            Next Problem →
                        </span>
                    </button>
                ) : (
                    // Show helpful feedback when submitted but not complete (has wrong answers)
                    <div className="text-center mb-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                            <div className="flex items-center justify-center gap-2 text-orange-700 font-semibold mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Fix the red squares to continue
                            </div>
                            <p className="text-orange-600 text-sm">
                                Change any incorrect answers (shown in red) to the correct values, then press Enter to advance.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmitControls; 