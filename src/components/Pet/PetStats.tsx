import React from 'react';
import type { Pet } from '../../types/pet';

interface PetStatsProps {
    pet: Pet;
}

const PetStats: React.FC<PetStatsProps> = ({ pet }) => {
    const getStatColor = (value: number, stat: 'happiness' | 'hunger') => {
        if (stat === 'happiness') {
            if (value > 80) return 'bg-green-500';
            if (value > 60) return 'bg-yellow-500';
            if (value > 40) return 'bg-orange-500';
            return 'bg-red-500';
        } else {
            // For hunger, higher is better
            if (value > 80) return 'bg-green-500';
            if (value > 60) return 'bg-yellow-500';
            if (value > 40) return 'bg-orange-500';
            return 'bg-red-500';
        }
    };

    const getStatIcon = (stat: 'happiness' | 'hunger') => {
        return stat === 'happiness' ? '❤️' : '🍖';
    };

    const StatBar = ({ label, value, maxValue, icon, stat }: {
        label: string;
        value: number;
        maxValue: number;
        icon: string;
        stat: 'happiness' | 'hunger';
    }) => (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                    {value}/{maxValue}
                </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${getStatColor(value, stat)}`}
                    style={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
                <div className="text-sm text-gray-500">
                    Level {pet.level}
                </div>
            </div>

            {/* Happiness and Hunger bars */}
            <StatBar
                label="Happiness"
                value={pet.happiness}
                maxValue={100}
                icon={getStatIcon('happiness')}
                stat="happiness"
            />

            <StatBar
                label="Hunger"
                value={pet.hunger}
                maxValue={100}
                icon={getStatIcon('hunger')}
                stat="hunger"
            />

            {/* Experience bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">⭐</span>
                        <span className="text-sm font-medium text-gray-700">Experience</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                        {pet.experience % 200}/200
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${((pet.experience % 200) / 200) * 100}%` }}
                    />
                </div>
            </div>

            {/* Pet stage and problems helped */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Stage: <span className="font-semibold capitalize">{pet.stage}</span></span>
                    <span>Problems: <span className="font-semibold">{pet.totalProblemsHelped}</span></span>
                </div>
            </div>
        </div>
    );
};

export default PetStats; 