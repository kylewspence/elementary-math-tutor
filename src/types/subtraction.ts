// Subtraction types for the Math Tutor app
import type { GameMode } from './game';

export interface SubtractionLevel {
    id: number;
    name: string;
    description: string;
    maxDigits: number;
    maxValue: number;
    borrowRequired: boolean;
}

export interface SubtractionProblem {
    minuend: number;
    subtrahend: number;
    difference: number;
    steps: SubtractionStep[];
    source?: 'api' | 'local'; // Track if problem came from API or local generation
    isEditable?: boolean;
}

export interface SubtractionStep {
    stepNumber: number;
    columnPosition: number;  // Position from right (ones, tens, hundreds, etc.)
    digit1: number;          // Digit from minuend
    digit2: number;          // Digit from subtrahend
    difference: number;      // Difference of digits
    borrow: number;          // Borrow from next column (0 or 1)
    borrowReceived: number;  // Borrow received from previous column (0 or 1)
}

export interface SubtractionUserAnswer {
    columnPosition: number;
    fieldType: 'difference' | 'borrow';
    value: number;
    isCorrect: boolean;
    timestamp: Date;
}

export interface SubtractionGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: SubtractionProblem[];
    problem: SubtractionProblem | null;
    userAnswers: SubtractionUserAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: GameMode;
} 