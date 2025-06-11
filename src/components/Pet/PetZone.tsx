import React, { useState } from 'react';
import type { Pet } from '../../types/pet';
import PetAnimation from './PetAnimation';
import PetStats from './PetStats';
import { TREAT_COSTS } from '../../utils/petData';

interface PetZoneProps {
    pet: Pet;
    onFeed: () => void;
    onPlay: () => void;
    canAffordFeed: boolean;
    canAffordPlay: boolean;
    trigger?: 'correct' | 'wrong' | 'feed' | 'play';
}

const PetZone: React.FC<PetZoneProps> = ({
    pet,
    onFeed,
    onPlay,
    canAffordFeed,
    canAffordPlay,
    trigger,
}) => {
    const [lastTrigger, setLastTrigger] = useState<string>('');

    const handleFeed = () => {
        if (canAffordFeed) {
            onFeed();
            setLastTrigger('feed');
            setTimeout(() => setLastTrigger(''), 100);
        }
    };

    const handlePlay = () => {
        if (canAffordPlay) {
            onPlay();
            setLastTrigger('play');
            setTimeout(() => setLastTrigger(''), 100);
        }
    };

    const currentTrigger = trigger || (lastTrigger as any);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">🐲 Pet Zone</h2>
                <p className="text-sm text-gray-600">
                    Take care of your math buddy!
                </p>
            </div>

            {/* Pet Animation Area */}
            <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
                <PetAnimation
                    pet={pet}
                    happiness={pet.happiness}
                    isActive={true}
                    trigger={currentTrigger}
                />
            </div>

            {/* Pet Stats */}
            <div className="mb-4">
                <PetStats pet={pet} />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={handleFeed}
                    disabled={!canAffordFeed}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${canAffordFeed
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <span className="text-lg">🍖</span>
                    <span>Feed</span>
                    <span className="text-sm">({TREAT_COSTS.feed} treat{TREAT_COSTS.feed > 1 ? 's' : ''})</span>
                </button>

                <button
                    onClick={handlePlay}
                    disabled={!canAffordPlay}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${canAffordPlay
                        ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <span className="text-lg">💎</span>
                    <span>Play</span>
                    <span className="text-sm">({TREAT_COSTS.play} treat{TREAT_COSTS.play > 1 ? 's' : ''})</span>
                </button>

                {/* Status messages */}
                <div className="text-center text-sm text-gray-600">
                    {pet.hunger < 30 && (
                        <p className="text-orange-600 font-medium">
                            🍖 {pet.name} is getting hungry!
                        </p>
                    )}
                    {pet.happiness < 30 && (
                        <p className="text-red-600 font-medium">
                            😢 {pet.name} needs some attention!
                        </p>
                    )}
                    {pet.hunger > 80 && pet.happiness > 80 && (
                        <p className="text-green-600 font-medium">
                            😊 {pet.name} is very happy!
                        </p>
                    )}
                </div>
            </div>

            {/* Helpful tips */}
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 text-center">
                    💡 Solve math problems correctly to earn treats for your pet!
                </p>
            </div>
        </div>
    );
};

export default PetZone; 