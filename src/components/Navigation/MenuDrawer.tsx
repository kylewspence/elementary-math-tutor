import React from 'react';
import type { GameState } from '../../types/game';

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onLevelSelect: (level: number) => void;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({
    isOpen,
    onClose,
    gameState,
    onLevelSelect,
}) => {
    const levels = Array.from({ length: 10 }, (_, i) => i + 1);

    const getLevelDescription = (level: number) => {
        if (level <= 3) return 'Single-digit divisors';
        if (level <= 6) return 'Two-digit divisors';
        if (level <= 8) return 'Three-digit divisors';
        return 'Four-digit divisors';
    };

    const handleLevelClick = (level: number) => {
        onLevelSelect(level);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                aria-label="Close menu"
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-gray-600 transform rotate-45 absolute"></div>
                                    <div className="w-4 h-0.5 bg-gray-600 transform -rotate-45 absolute"></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Level Selection */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Level</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {levels.map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleLevelClick(level)}
                                        className={`p-3 rounded-lg border-2 text-left transition-all ${gameState.currentLevel === level
                                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="font-bold">Level {level}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {getLevelDescription(level)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Game Stats */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistics</h3>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Level</span>
                                        <span className="font-bold">{gameState.currentLevel}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Problem</span>
                                        <span className="font-bold">{gameState.currentProblem} / {gameState.totalProblems}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <span className="font-bold">
                                            {gameState.isComplete ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Help Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Play</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Solve division problems to earn treats</p>
                                <p>• Feed and play with your pet using treats</p>
                                <p>• Keep your pet happy and well-fed</p>
                                <p>• Unlock new pets by progressing through levels</p>
                                <p>• Use Tab/Shift+Tab to navigate between fields</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MenuDrawer; 