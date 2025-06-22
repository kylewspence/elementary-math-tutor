import React from 'react';

interface ErrorMessageProps {
    onSubmit: () => void;
    disabled?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ onSubmit, disabled = false }) => {
    return (
        <div className="text-center mb-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-center gap-2 text-orange-700 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Fix the red squares to continue
                </div>
            </div>
            {/* Submit button for error state - allows mobile users to resubmit */}
            <button
                onClick={onSubmit}
                disabled={disabled}
                className={`px-6 py-2 rounded-lg font-semibold ${disabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    } transition-colors`}
            >
                <span className="flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Submit
                </span>
            </button>
        </div>
    );
};

export default ErrorMessage; 