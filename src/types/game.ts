// Core game types for the Math Tutor app

export interface GameLevel {
    id: number;
    name: string;
    description: string;
    divisorDigits: number;
    dividendDigits: number;
    maxDivisor: number;
    maxDividend: number;
}

export interface DivisionProblem {
    dividend: number;
    divisor: number;
    quotient: number;
    remainder: number;
    steps: DivisionStep[];
    isEditable?: boolean;
}

export interface DivisionStep {
    stepNumber: number;
    dividendPart: number;  // The part of dividend we're working with
    quotientDigit: number; // The digit we put in quotient
    multiply: number;      // divisor * quotientDigit
    subtract: number;      // dividendPart - multiply
    bringDown?: number;    // Next digit brought down (if any)
}

export type GameMode = 'practice' | 'rescue';

export interface GameState {
    currentLevel: number;
    currentProblem: number; // 1-10 within the level
    totalProblems: number;  // Always 10 per level
    isComplete: boolean;
    problem: DivisionProblem | null;
    userAnswers: UserAnswer[];
    errors: string[];
    isSubmitted?: boolean; // New flag to track if problem has been submitted
    gameMode?: GameMode; // New field to track current game mode
}

export interface UserAnswer {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
    value: number;
    isCorrect: boolean;
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

export interface KeyboardNavigation {
    currentField: { stepNumber: number; fieldType: string; position: number } | null;
    moveNext: () => void;
    movePrevious: () => void;
    jumpToField: (stepNumber: number, fieldType: string, position: number) => void;
} 