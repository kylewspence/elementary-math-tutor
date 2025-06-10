import React from 'react';

interface HeaderProps {
    gameMode?: 'practice' | 'rescue';
    onGameModeToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ gameMode = 'practice', onGameModeToggle }) => {
    return (
        <header className="bg-white border-b-2 border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Math Tutor</h1>
                    <p className="text-gray-600 mt-1">Long Division Practice</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Game Mode Indicator */}
                    <div className="text-sm text-gray-600">
                        Mode: <span className="font-semibold capitalize">{gameMode}</span>
                    </div>

                    {/* Game Mode Toggle Button */}
                    <button
                        onClick={onGameModeToggle}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${gameMode === 'rescue'
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                    >
                        {gameMode === 'rescue' ? '📚 Practice Mode' : '🎮 Rescue Mode'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header; 