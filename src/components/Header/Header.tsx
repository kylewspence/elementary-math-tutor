import React from 'react';

interface HeaderProps {
    gameMode: 'division' | 'addition';
    toggleGameMode: () => void;
    currentLevel?: number;
    currentProblem?: number;
    totalProblems?: number;
}

const Header: React.FC<HeaderProps> = ({
    gameMode,
    toggleGameMode,
    currentLevel = 1,
    currentProblem = 1,
    totalProblems = 1
}) => {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Math Tutor
                    </h1>
                    <p className="text-gray-600 text-sm mt-1 mb-3">
                        Step-by-Step Math Practice
                    </p>

                    {/* Game Mode Toggle */}
                    <div className="flex justify-center mb-2">
                        <div className="bg-white rounded-lg shadow-md p-1 flex">
                            <button
                                onClick={() => gameMode !== 'division' && toggleGameMode()}
                                className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'division'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Division
                            </button>
                            <button
                                onClick={() => gameMode !== 'addition' && toggleGameMode()}
                                className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'addition'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Addition
                            </button>
                        </div>
                    </div>

                    {/* Current Level & Problem Info */}
                    <div className="flex items-center justify-center text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                        <div className="font-semibold mr-2">Level {currentLevel}</div>
                        <div className="text-blue-600">•</div>
                        <div className="ml-2">Problem {currentProblem}/{totalProblems}</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 