// Core game types for the Math Tutor app
import type { MultiplicationProblem } from './multiplication';
import type { AdditionProblem } from './addition';

// Centralized game mode type
export type GameMode = 'division' | 'addition' | 'multiplication' | 'subtraction';

export interface GameLevel {
    id: number;
    name: string;
    description: string;
    divisorDigits: number;
    dividendDigits: number;
    maxDivisor: number;
    maxDividend: number;
    minDigits?: number;  // Minimum number of digits for multiplication problems
    maxDigits?: number;  // Maximum number of digits for multiplication problems
}

export interface DivisionProblem {
    dividend: number;
    divisor: number;
    quotient: number;
    remainder: number;
    steps: DivisionStep[];
    isEditable?: boolean;
    source?: 'api' | 'local'; // Track if problem came from API or local generation
}

export interface DivisionStep {
    stepNumber: number;
    dividendPart: number;  // The part of dividend we're working with
    quotientDigit: number; // The digit we put in quotient
    multiply: number;      // divisor * quotientDigit
    subtract: number;      // dividendPart - multiply
    bringDown?: number;    // Next digit brought down (if any)
}

export interface DivisionGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: DivisionProblem[];
    problem: DivisionProblem | null;
    userAnswers: UserAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'division';
}

export interface AdditionGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: AdditionProblem[];
    problem: AdditionProblem | null;
    userAnswers: UserAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'addition';
}

export interface MultiplicationGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: MultiplicationProblem[];
    problem: MultiplicationProblem | null;
    userAnswers: UserAnswer[]; // Reusing UserAnswer type for consistency
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'multiplication';
}

// Union type for all game states
export type GameState = DivisionGameState | AdditionGameState | MultiplicationGameState;

export interface UserAnswer {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
    value: number;
    isCorrect: boolean | null; // null = pending, true = correct, false = incorrect
    timestamp: Date;
}

export interface InputFieldState {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
    value: number | null;
    isActive: boolean;
    isCorrect: boolean | null;
    isError: boolean;
} 