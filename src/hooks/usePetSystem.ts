import { useState, useCallback, useEffect, useRef } from 'react';
import type { Pet, PetSystemState, PetAction, UserSettings } from '../types/pet';
import { PET_TYPES, TREAT_REWARDS, TREAT_COSTS, HAPPINESS_CHANGES, EXPERIENCE_REWARDS, EVOLUTION_THRESHOLDS } from '../utils/petData';

const STORAGE_KEY = 'petSystemState';
const SAVE_VERSION = '1.0.0';

const createDefaultPet = (): Pet => ({
    id: 'dragon-starter',
    name: 'Sparky',
    type: 'dragon',
    level: 1,
    experience: 0,
    happiness: 80,
    hunger: 75,
    stage: 'egg',
    unlockedAt: 1,
    lastFed: new Date(),
    totalProblemsHelped: 0,
});

const createDefaultSettings = (): UserSettings => ({
    soundEnabled: true,
    animationsEnabled: true,
    reducedMotion: false,
});

export const usePetSystem = () => {
    const [petState, setPetState] = useState<PetSystemState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.version === SAVE_VERSION && data.pets?.length > 0) {
                    return {
                        activePet: data.pets.find((p: Pet) => p.id === data.activePetId) || data.pets[0],
                        ownedPets: data.pets,
                        treats: data.treats || 0,
                        lastUpdate: new Date(data.lastPlayed || Date.now()),
                        totalProblemsCompleted: data.totalProblemsCompleted || 0,
                    };
                }
            }
        } catch (error) {
            console.warn('Failed to load pet data:', error);
        }

        const defaultPet = createDefaultPet();
        return {
            activePet: defaultPet,
            ownedPets: [defaultPet],
            treats: 3, // Start with some treats
            lastUpdate: new Date(),
            totalProblemsCompleted: 0,
        };
    });

    const hungerIntervalRef = useRef<number | undefined>(undefined);

    // Save to localStorage whenever state changes
    useEffect(() => {
        const saveData = {
            version: SAVE_VERSION,
            pets: petState.ownedPets,
            activePetId: petState.activePet.id,
            treats: petState.treats,
            totalProblemsCompleted: petState.totalProblemsCompleted,
            settings: createDefaultSettings(),
            lastPlayed: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }, [petState]);

    // Set up hunger decay timer and encouragement system
    useEffect(() => {
        if (hungerIntervalRef.current) {
            clearInterval(hungerIntervalRef.current);
        }

        hungerIntervalRef.current = setInterval(() => {
            setPetState(prev => ({
                ...prev,
                activePet: {
                    ...prev.activePet,
                    hunger: Math.max(0, prev.activePet.hunger - 1),
                    happiness: prev.activePet.hunger < 20
                        ? Math.max(0, prev.activePet.happiness + HAPPINESS_CHANGES.hungerPenalty)
                        : Math.min(100, prev.activePet.happiness + 1), // Small encouragement boost every 30 seconds
                },
                ownedPets: prev.ownedPets.map(pet =>
                    pet.id === prev.activePet.id
                        ? {
                            ...pet,
                            hunger: Math.max(0, pet.hunger - 1),
                            happiness: pet.hunger < 20
                                ? Math.max(0, pet.happiness + HAPPINESS_CHANGES.hungerPenalty)
                                : Math.min(100, pet.happiness + 1), // Small encouragement boost
                        }
                        : pet
                ),
            }));
        }, 30000); // Every 30 seconds

        return () => {
            if (hungerIntervalRef.current) {
                clearInterval(hungerIntervalRef.current);
            }
        };
    }, []);

    const updatePetStage = useCallback((pet: Pet): Pet => {
        const problems = pet.totalProblemsHelped;
        let newStage = pet.stage;

        if (problems >= EVOLUTION_THRESHOLDS.legendary.min) {
            newStage = 'legendary';
        } else if (problems >= EVOLUTION_THRESHOLDS.adult.min) {
            newStage = 'adult';
        } else if (problems >= EVOLUTION_THRESHOLDS.juvenile.min) {
            newStage = 'juvenile';
        } else if (problems >= EVOLUTION_THRESHOLDS.baby.min) {
            newStage = 'baby';
        } else {
            newStage = 'egg';
        }

        return { ...pet, stage: newStage };
    }, []);

    const dispatchPetAction = useCallback((action: PetAction) => {
        setPetState(prev => {
            let newState = { ...prev };
            let updatedActivePet = { ...prev.activePet };

            switch (action.type) {
                case 'CORRECT_ANSWER':
                    updatedActivePet = {
                        ...updatedActivePet,
                        experience: updatedActivePet.experience + EXPERIENCE_REWARDS.correctAnswer,
                        happiness: Math.min(100, updatedActivePet.happiness + HAPPINESS_CHANGES.correctAnswer),
                    };
                    newState.treats += TREAT_REWARDS.correctAnswer;
                    break;

                case 'WRONG_ANSWER':
                    updatedActivePet = {
                        ...updatedActivePet,
                        happiness: Math.max(0, updatedActivePet.happiness + HAPPINESS_CHANGES.wrongAnswer),
                    };
                    break;

                case 'COMPLETE_PROBLEM':
                    updatedActivePet = {
                        ...updatedActivePet,
                        experience: updatedActivePet.experience + EXPERIENCE_REWARDS.completedProblem,
                        happiness: Math.min(100, updatedActivePet.happiness + HAPPINESS_CHANGES.correctAnswer),
                        totalProblemsHelped: updatedActivePet.totalProblemsHelped + 1,
                    };
                    updatedActivePet = updatePetStage(updatedActivePet);
                    newState.treats += TREAT_REWARDS.completedProblem;
                    newState.totalProblemsCompleted += 1;
                    break;

                case 'FEED_PET':
                    if (newState.treats >= TREAT_COSTS.feed) {
                        updatedActivePet = {
                            ...updatedActivePet,
                            hunger: Math.min(100, updatedActivePet.hunger + 30),
                            happiness: Math.min(100, updatedActivePet.happiness + HAPPINESS_CHANGES.feeding),
                            lastFed: new Date(),
                        };
                        newState.treats -= TREAT_COSTS.feed;
                    }
                    break;

                case 'PLAY_WITH_PET':
                    if (newState.treats >= TREAT_COSTS.play) {
                        updatedActivePet = {
                            ...updatedActivePet,
                            happiness: Math.min(100, updatedActivePet.happiness + HAPPINESS_CHANGES.playing),
                        };
                        newState.treats -= TREAT_COSTS.play;
                    }
                    break;

                case 'SWITCH_PET':
                    const newActivePet = prev.ownedPets.find(pet => pet.id === action.payload);
                    if (newActivePet) {
                        newState.activePet = newActivePet;
                        return newState;
                    }
                    break;

                case 'UNLOCK_PET':
                    // Implementation for unlocking new pets
                    break;

                default:
                    return prev;
            }

            // Update pet level based on experience
            const newLevel = Math.floor(updatedActivePet.experience / EXPERIENCE_REWARDS.levelUp) + 1;
            if (newLevel > updatedActivePet.level) {
                updatedActivePet.level = newLevel;
                newState.treats += TREAT_REWARDS.levelUp;
            }

            // Update active pet and owned pets array
            newState.activePet = updatedActivePet;
            newState.ownedPets = prev.ownedPets.map(pet =>
                pet.id === updatedActivePet.id ? updatedActivePet : pet
            );

            return newState;
        });
    }, [updatePetStage]);

    const feedPet = useCallback(() => {
        dispatchPetAction({ type: 'FEED_PET' });
    }, [dispatchPetAction]);

    const playWithPet = useCallback(() => {
        dispatchPetAction({ type: 'PLAY_WITH_PET' });
    }, [dispatchPetAction]);

    const switchPet = useCallback((petId: string) => {
        dispatchPetAction({ type: 'SWITCH_PET', payload: petId });
    }, [dispatchPetAction]);

    const handleCorrectAnswer = useCallback(() => {
        dispatchPetAction({ type: 'CORRECT_ANSWER' });
    }, [dispatchPetAction]);

    const handleWrongAnswer = useCallback(() => {
        dispatchPetAction({ type: 'WRONG_ANSWER' });
    }, [dispatchPetAction]);

    const handleCompleteProblem = useCallback(() => {
        dispatchPetAction({ type: 'COMPLETE_PROBLEM' });
    }, [dispatchPetAction]);

    const getUnlockedPets = useCallback(() => {
        return Object.entries(PET_TYPES).filter(([_, config]) => {
            return petState.totalProblemsCompleted >= config.unlockProblems;
        }).map(([type]) => type);
    }, [petState.totalProblemsCompleted]);

    const canAffordAction = useCallback((action: 'feed' | 'play' | 'evolve' | 'unlockPet') => {
        return petState.treats >= TREAT_COSTS[action];
    }, [petState.treats]);

    return {
        petState,
        feedPet,
        playWithPet,
        switchPet,
        handleCorrectAnswer,
        handleWrongAnswer,
        handleCompleteProblem,
        getUnlockedPets,
        canAffordAction,
        dispatchPetAction,
    };
}; 