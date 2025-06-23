import React from 'react';
import type { GameMode } from '../../types/game';
import { NumberTicker } from '../UI/number-ticker';

interface HeaderProps {
    gameMode: GameMode;
    onToggleGameMode: (mode: GameMode) => void;
    currentLevel?: number;
    currentProblem?: number;
    totalProblems?: number;
    score?: number;
}

const Header: React.FC<HeaderProps> = ({
    gameMode,
    onToggleGameMode,
    currentLevel = 1,
    currentProblem = 1,
    totalProblems = 1,
    score = 0
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
                                onClick={() => onToggleGameMode('division')}
                                className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'division'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Division
                            </button>
                            <button
                                onClick={() => onToggleGameMode('addition')}
                                className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'addition'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Addition
                            </button>
                            <button
                                onClick={() => onToggleGameMode('multiplication')}
                                className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'multiplication'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Multiplication
                            </button>
                            <button
                                onClick={() => onToggleGameMode('subtraction')}
                                className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'subtraction'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Subtraction
                            </button>
                        </div>
                    </div>

                    {/* Current Level & Problem Info */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                        {/* Level and Problem Info */}
                        <div className="text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                            <div className="font-semibold mr-2 inline">Level {currentLevel}</div>
                            {currentProblem && totalProblems && (
                                <>
                                    <div className="text-blue-600 inline">•</div>
                                    <div className="ml-2 inline">Problem {currentProblem}/{totalProblems}</div>
                                </>
                            )}
                        </div>

                        {/* Score Display */}
                        <div className="text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                            <div className="font-semibold flex items-center gap-2">
                                <span>Score:</span>
                                <NumberTicker
                                    value={score}
                                    className="text-green-800 font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 