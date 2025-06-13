import React, { useState } from 'react';
import { GAME_LEVELS, ADDITION_LEVELS } from '../../utils/constants';
import type { GameState } from '../../types/game';
import type { AdditionGameState } from '../../types/addition';

interface LevelSelectorDrawerProps {
    gameState: GameState | AdditionGameState;
    onLevelSelect: (levelId: number) => void;
}

const LevelSelectorDrawer: React.FC<LevelSelectorDrawerProps> = ({ gameState, onLevelSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentLevel, currentProblemIndex, levelProblems, gameMode } = gameState as (GameState & { gameMode?: 'division' | 'addition' });

    const currentProblem = currentProblemIndex + 1; // Convert to 1-based
    const totalProblems = levelProblems.length;
    const progressPercentage = Math.round((currentProblem / totalProblems) * 100);

    // Determine which levels to use based on game mode
    const levels = gameMode === 'addition' ? ADDITION_LEVELS : GAME_LEVELS;

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const handleLevelSelect = (levelId: number) => {
        onLevelSelect(levelId);
        setIsOpen(false); // Close drawer after selection
    };

    return (
        <>
            {/* Hamburger Menu Button - Fixed at the bottom right corner */}
            <button
                onClick={toggleDrawer}
                className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                aria-label="Open level selector"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="sr-only">Levels</span>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={toggleDrawer}
                    aria-hidden="true"
                ></div>
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-80 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out overflow-y-auto`}
            >
                <div className="p-4">
                    {/* Drawer Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-blue-800">Select Level</h2>
                        <button
                            onClick={toggleDrawer}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close level selector"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Current Level Display */}
                    <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-200 mb-6">
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
                        <div>
                            <div className="w-full bg-blue-200 rounded-full h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <div className="text-xs text-blue-600 text-center mt-1">
                                {progressPercentage}% Complete
                            </div>
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
                                    onClick={() => handleLevelSelect(level.id)}
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
            </div>
        </>
    );
};

export default LevelSelectorDrawer; 