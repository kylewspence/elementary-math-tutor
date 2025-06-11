import React from 'react';

interface CompactHeaderProps {
    currentLevel: number;
    totalLevels: number;
    progress: number;
    treats: number;
    onMenuToggle: () => void;
}

const CompactHeader: React.FC<CompactHeaderProps> = ({
    currentLevel,
    totalLevels,
    progress,
    treats,
    onMenuToggle,
}) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left side - App title */}
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">🎓</div>
                        <h1 className="text-xl font-bold text-gray-800">Math Tutor</h1>
                    </div>

                    {/* Center - Level and Progress */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Level</span>
                            <span className="text-lg font-bold text-blue-600">
                                {currentLevel}/{totalLevels}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Progress</span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Right side - Treats and Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Treats counter */}
                        <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                            <span className="text-lg">🍖</span>
                            <span className="font-bold text-orange-700">{treats}</span>
                        </div>

                        {/* Hamburger menu button */}
                        <button
                            onClick={onMenuToggle}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Open menu"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                                <div className="w-full h-0.5 bg-gray-600"></div>
                                <div className="w-full h-0.5 bg-gray-600"></div>
                                <div className="w-full h-0.5 bg-gray-600"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CompactHeader; 