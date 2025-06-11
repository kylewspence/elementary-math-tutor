import React from 'react';
import type { Pet, PetType } from '../../types/pet';
import { PET_TYPES } from '../../utils/petData';

interface PetCollectionBarProps {
    ownedPets: Pet[];
    activePetId: string;
    onSwitchPet: (petId: string) => void;
    totalProblemsCompleted: number;
    currentLevel: number;
}

const PetCollectionBar: React.FC<PetCollectionBarProps> = ({
    ownedPets,
    activePetId,
    onSwitchPet,
    totalProblemsCompleted,
    currentLevel,
}) => {
    const allPetTypes: PetType[] = ['dragon', 'unicorn', 'cat', 'robot', 'ghost'];

    const isUnlocked = (petType: PetType) => {
        const config = PET_TYPES[petType];
        return currentLevel >= config.unlockLevel && totalProblemsCompleted >= config.unlockProblems;
    };

    const getOwnedPet = (petType: PetType) => {
        return ownedPets.find(pet => pet.type === petType);
    };

    const getUnlockRequirement = (petType: PetType) => {
        const config = PET_TYPES[petType];
        if (currentLevel < config.unlockLevel) {
            return `Level ${config.unlockLevel}`;
        }
        if (totalProblemsCompleted < config.unlockProblems) {
            return `${config.unlockProblems} problems`;
        }
        return 'Available';
    };

    return (
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Pet Collection</h3>

            <div className="flex items-center justify-center space-x-3 overflow-x-auto pb-2">
                {allPetTypes.map((petType) => {
                    const ownedPet = getOwnedPet(petType);
                    const unlocked = isUnlocked(petType);
                    const config = PET_TYPES[petType];
                    const isActive = ownedPet?.id === activePetId;

                    if (ownedPet) {
                        // Pet is owned
                        return (
                            <button
                                key={petType}
                                onClick={() => onSwitchPet(ownedPet.id)}
                                className={`relative group p-3 rounded-lg border-2 transition-all duration-200 ${isActive
                                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                title={`${ownedPet.name} the ${config.name} (Level ${ownedPet.level})`}
                            >
                                <div className="text-3xl">
                                    {config.stages[ownedPet.stage].emoji}
                                </div>
                                <div className="text-xs font-medium text-gray-700 mt-1">
                                    {ownedPet.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Lvl {ownedPet.level}
                                </div>

                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}

                                {/* Happiness indicator */}
                                <div className="absolute -bottom-1 -right-1 text-sm">
                                    {ownedPet.happiness > 80 ? '😊' : ownedPet.happiness > 40 ? '😐' : '😢'}
                                </div>
                            </button>
                        );
                    } else if (unlocked) {
                        // Pet is unlocked but not owned yet
                        return (
                            <div
                                key={petType}
                                className="relative group p-3 rounded-lg border-2 border-dashed border-green-400 bg-green-50"
                                title={`${config.name} - Ready to adopt!`}
                            >
                                <div className="text-3xl opacity-75">
                                    {config.emoji}
                                </div>
                                <div className="text-xs font-medium text-green-700 mt-1">
                                    Available
                                </div>
                                <div className="text-xs text-green-600">
                                    Adopt me!
                                </div>

                                {/* New pet indicator */}
                                <div className="absolute -top-1 -right-1 text-sm animate-pulse">
                                    ✨
                                </div>
                            </div>
                        );
                    } else {
                        // Pet is locked
                        return (
                            <div
                                key={petType}
                                className="relative group p-3 rounded-lg border-2 border-gray-300 bg-gray-100 opacity-50"
                                title={`${config.name} - Unlock at ${getUnlockRequirement(petType)}`}
                            >
                                <div className="text-3xl">
                                    🔒
                                </div>
                                <div className="text-xs font-medium text-gray-500 mt-1">
                                    Locked
                                </div>
                                <div className="text-xs text-gray-400">
                                    {getUnlockRequirement(petType)}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {/* Collection progress */}
            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Collection Progress</span>
                    <span className="font-bold text-gray-800">
                        {ownedPets.length}/{allPetTypes.length}
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(ownedPets.length / allPetTypes.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PetCollectionBar; 