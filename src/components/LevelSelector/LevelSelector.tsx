import React from 'react';
import { GAME_LEVELS, ADDITION_LEVELS } from '../../utils/constants';
import type { GameState } from '../../types/game';
import type { AdditionGameState } from '../../types/addition';
import type { MultiplicationGameState } from '../../types/multiplication';

interface LevelSelectorProps {
    gameState: GameState | AdditionGameState | MultiplicationGameState;
    onLevelSelect: (levelId: number) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ gameState, onLevelSelect }) => {
    const { currentLevel, currentProblemIndex, levelProblems, gameMode } = gameState;
    const currentProblem = currentProblemIndex + 1; // Convert to 1-based
    const totalProblems = levelProblems.length;

    // Determine which levels to use based on game mode
    const levels = gameMode === 'addition' ? ADDITION_LEVELS : GAME_LEVELS;

    return (
        <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-200">
            {/* Current Level Display */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-blue-800">Current Level:</h2>
                <div className="text-2xl font-bold text-blue-900">
                    Level {currentLevel}
                </div>
                <div className="text-sm text-blue-700">
                    Problem {currentProblem} of {totalProblems}
                </div>
            </div>

            {/* Progress Bar for Current Level */}
            <div className="mb-4">
                <div className="w-full bg-blue-200 rounded-full h-3">
                    <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(currentProblem / totalProblems) * 100}%` }}
                    />
                </div>
                <div className="text-xs text-blue-600 text-center mt-1">
                    {Math.round((currentProblem / totalProblems) * 100)}% Complete
                </div>
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Levels:</h3>
                {levels.map((level) => {
                    const isCurrentLevel = level.id === currentLevel;
                    const isUnlocked = level.id <= currentLevel;

                    return (
                        <button
                            key={level.id}
                            onClick={() => onLevelSelect(level.id)}
                            className={`
                w-full p-3 rounded-lg text-left transition-all duration-200
                ${isCurrentLevel
                                    ? 'bg-blue-500 text-white border-2 border-blue-600'
                                    : isUnlocked
                                        ? 'bg-white text-blue-800 border-2 border-blue-300 hover:bg-blue-50'
                                        : 'bg-gray-100 text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
                                }
              `}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{level.name}</div>
                                    <div className="text-xs opacity-75">{level.description}</div>
                                </div>
                                {isCurrentLevel && (
                                    <div className="text-xs bg-blue-600 px-2 py-1 rounded">
                                        Current
                                    </div>
                                )}
                                {!isUnlocked && (
                                    <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                        Skip To
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelSelector; 