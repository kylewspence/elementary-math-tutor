import React, { useEffect } from 'react';

interface ProblemCompleteProps {
    type: 'division' | 'multiplication' | 'addition';
    problem: {
        dividend?: number;
        divisor?: number;
        quotient?: number;
        remainder?: number;
        multiplicand?: number;
        multiplier?: number;
        product?: number;
        addend1?: number;
        addend2?: number;
        sum?: number;
    };
    onNextProblem: () => void;
    variant?: 'card' | 'notification';
}

const ProblemComplete: React.FC<ProblemCompleteProps> = ({
    type,
    problem,
    onNextProblem,
    variant = 'notification'
}) => {
    // Add keyboard event listener for Enter key with a delay to prevent immediate triggering
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onNextProblem();
            }
        };

        // Add a small delay before enabling the keyboard listener
        // This prevents the Enter key that triggered submission from immediately advancing
        const timeoutId = setTimeout(() => {
            document.addEventListener('keydown', handleKeyDown);
        }, 200);

        // Clean up
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onNextProblem]);

    // Generate the appropriate message based on problem type
    const getMessage = () => {
        switch (type) {
            case 'division':
                return `Great job! You solved ${problem.dividend} ÷ ${problem.divisor} = ${problem.quotient}${problem.remainder && problem.remainder > 0 ? ` remainder ${problem.remainder}` : ''
                    }`;
            case 'multiplication':
                return `Great job! You solved ${problem.multiplicand} × ${problem.multiplier} = ${problem.product}`;
            case 'addition':
                return `Great job! You solved ${problem.addend1} + ${problem.addend2} = ${problem.sum}`;
            default:
                return 'Great job! Problem complete!';
        }
    };

    if (variant === 'card') {
        return (
            <div className="flex justify-center mb-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2 text-center shadow-sm">
                    <h3 className="text-sm font-bold text-green-800 flex items-center justify-center gap-1">
                        Problem complete! 🎉
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <div className="problem-complete-notification mt-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-md shadow-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Problem Complete!</h3>
                    <div className="mt-2 text-sm text-green-700">
                        <p>{getMessage()}</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={onNextProblem}
                            className="bg-green-500 text-white px-4 py-1 rounded text-sm font-medium hover:bg-green-600 transition-colors"
                            autoFocus
                        >
                            Next Problem →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemComplete; 