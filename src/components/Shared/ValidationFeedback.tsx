import React from 'react';
import Button from '../UI/Button';

export interface ValidationResult {
    isValid: boolean;
    message?: string;
    hint?: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
}

export interface ValidationFeedbackProps {
    validation: ValidationResult;
    showHint?: boolean;
    onHintToggle?: () => void;
    className?: string;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
    validation,
    showHint = false,
    onHintToggle,
    className = ""
}) => {
    const { isValid, message, hint, severity } = validation;

    // If no message and no hint, don't render anything
    if (!message && !hint) {
        return null;
    }

    // Determine styling based on validation state and severity
    const getMessageStyles = () => {
        if (severity) {
            switch (severity) {
                case 'success':
                    return 'bg-green-50 border-green-200 text-green-800';
                case 'error':
                    return 'bg-red-50 border-red-200 text-red-800';
                case 'warning':
                    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
                case 'info':
                    return 'bg-blue-50 border-blue-200 text-blue-800';
                default:
                    return isValid
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800';
            }
        }

        return isValid
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800';
    };

    const getIcon = () => {
        const iconColor = severity === 'success' || isValid ? 'text-green-600' : 'text-red-600';

        if (severity === 'success' || isValid) {
            return (
                <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            );
        } else if (severity === 'warning') {
            return (
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            );
        } else if (severity === 'info') {
            return (
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    return (
        <div className={`validation-feedback mt-4 ${className}`}>
            {/* Main Message */}
            {message && (
                <div className={`p-3 rounded-lg border ${getMessageStyles()}`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hint Section */}
            {hint && onHintToggle && (
                <div className="mt-3">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onHintToggle}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            {showHint ? 'Hide Hint' : 'Show Hint'}
                            <svg
                                className={`ml-1 w-4 h-4 transform transition-transform ${showHint ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Button>
                    </div>

                    {showHint && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Hint:</strong> {hint}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Reference */}
            {!isValid && (
                <div className="mt-3 text-xs text-gray-500">
                    <p>💡 Remember: Use your numpad for fast input, Tab to move forward, Shift+Tab to go back</p>
                </div>
            )}
        </div>
    );
};

export default ValidationFeedback; 