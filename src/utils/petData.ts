import type { PetConfig, PetType } from '../types/pet';

export const PET_TYPES: Record<PetType, PetConfig> = {
    dragon: {
        name: 'Dragon',
        emoji: '🐲',
        unlockLevel: 1,
        unlockProblems: 0,
        stages: {
            egg: { emoji: '🥚', animation: 'wobble' },
            baby: { emoji: '🐣', animation: 'bounce' },
            juvenile: { emoji: '🐲', animation: 'fly' },
            adult: { emoji: '🐉', animation: 'roar' },
            legendary: { emoji: '✨🐉✨', animation: 'breatheFire' }
        }
    },
    unicorn: {
        name: 'Unicorn',
        emoji: '🦄',
        unlockLevel: 3,
        unlockProblems: 15,
        stages: {
            egg: { emoji: '🥚', animation: 'shimmer' },
            baby: { emoji: '🦄', animation: 'prance' },
            juvenile: { emoji: '🦄', animation: 'gallop' },
            adult: { emoji: '🦄', animation: 'sparkle' },
            legendary: { emoji: '✨🦄✨', animation: 'rainbow' }
        }
    },
    cat: {
        name: 'Cat',
        emoji: '🐱',
        unlockLevel: 5,
        unlockProblems: 30,
        stages: {
            egg: { emoji: '🥚', animation: 'wiggle' },
            baby: { emoji: '🐱', animation: 'play' },
            juvenile: { emoji: '🐱', animation: 'prowl' },
            adult: { emoji: '🐈', animation: 'stretch' },
            legendary: { emoji: '✨🐈✨', animation: 'ninja' }
        }
    },
    robot: {
        name: 'Robot',
        emoji: '🤖',
        unlockLevel: 7,
        unlockProblems: 50,
        stages: {
            egg: { emoji: '📦', animation: 'beep' },
            baby: { emoji: '🤖', animation: 'waddle' },
            juvenile: { emoji: '🤖', animation: 'compute' },
            adult: { emoji: '🤖', animation: 'transform' },
            legendary: { emoji: '✨🤖✨', animation: 'upgrade' }
        }
    },
    ghost: {
        name: 'Ghost',
        emoji: '👻',
        unlockLevel: 9,
        unlockProblems: 75,
        stages: {
            egg: { emoji: '🌫️', animation: 'swirl' },
            baby: { emoji: '👻', animation: 'float' },
            juvenile: { emoji: '👻', animation: 'phase' },
            adult: { emoji: '👻', animation: 'haunt' },
            legendary: { emoji: '✨👻✨', animation: 'phantom' }
        }
    }
};

export const TREAT_REWARDS = {
    correctAnswer: 1,
    completedProblem: 3,
    levelUp: 5,
    perfectStreak: 2,    // 5 correct in a row
};

export const TREAT_COSTS = {
    feed: 1,
    play: 2,
    evolve: 5,
    unlockPet: 10,
};

export const PET_UNLOCK_REQUIREMENTS = {
    dragon: { level: 1, problems: 0 },      // Starter pet
    unicorn: { level: 3, problems: 15 },
    cat: { level: 5, problems: 30 },
    robot: { level: 7, problems: 50 },
    ghost: { level: 9, problems: 75 },
};

export const EXPERIENCE_REWARDS = {
    correctAnswer: 10,
    completedProblem: 50,
    levelUp: 200,  // XP needed per level
};

export const HAPPINESS_CHANGES = {
    correctAnswer: 15,
    wrongAnswer: -5,
    feeding: 25,
    playing: 35,
    hungerPenalty: -1, // per hunger point below 20
};

export const EVOLUTION_THRESHOLDS = {
    egg: { min: 0, max: 1 },
    baby: { min: 2, max: 10 },
    juvenile: { min: 11, max: 25 },
    adult: { min: 26, max: 50 },
    legendary: { min: 51, max: Infinity },
}; 