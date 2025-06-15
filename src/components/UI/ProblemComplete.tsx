import React from 'react';

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
            <div className="absolute top-0 right-0 w-64 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-green-800 mb-1">
                    Problem Complete!
                </h3>
                <p className="text-sm text-green-700 mb-3">
                    {getMessage()}
                </p>
                <button
                    onClick={onNextProblem}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                    autoFocus
                >
                    Next Problem →
                </button>
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