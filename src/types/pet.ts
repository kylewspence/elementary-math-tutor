export type PetType = 'dragon' | 'unicorn' | 'cat' | 'robot' | 'ghost';
export type PetStage = 'egg' | 'baby' | 'juvenile' | 'adult' | 'legendary';

export interface Pet {
    id: string;
    name: string;
    type: PetType;
    level: number;
    experience: number;
    happiness: number;    // 0-100, affects animations
    hunger: number;       // 0-100, decreases over time
    stage: PetStage;      // egg, baby, juvenile, adult, legendary
    unlockedAt: number;   // math level when unlocked
    lastFed: Date;
    totalProblemsHelped: number;
}

export interface PetStageConfig {
    emoji: string;
    animation: string;
}

export interface PetConfig {
    name: string;
    emoji: string;
    unlockLevel: number;
    unlockProblems: number;
    stages: Record<PetStage, PetStageConfig>;
}

export interface PetSystemState {
    activePet: Pet;
    ownedPets: Pet[];
    treats: number;
    lastUpdate: Date;
    totalProblemsCompleted: number;
}

export interface SaveData {
    version: string;
    pets: Pet[];
    activePetId: string;
    treats: number;
    totalProblemsCompleted: number;
    settings: UserSettings;
    lastPlayed: Date;
}

export interface UserSettings {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    reducedMotion: boolean;
}

export interface PetAction {
    type: 'CORRECT_ANSWER' | 'WRONG_ANSWER' | 'COMPLETE_PROBLEM' | 'FEED_PET' | 'PLAY_WITH_PET' | 'SWITCH_PET' | 'UNLOCK_PET' | 'UPDATE_HUNGER';
    payload?: any;
} 