// Addition types for the Math Tutor app

export interface AdditionLevel {
    id: number;
    name: string;
    description: string;
    maxDigits: number;
    maxValue: number;
    carryRequired: boolean;
}

export interface AdditionProblem {
    addend1: number;
    addend2: number;
    sum: number;
    steps: AdditionStep[];
    source?: 'api' | 'local'; // Track if problem came from API or local generation
    isEditable?: boolean;
}

export interface AdditionStep {
    stepNumber: number;
    columnPosition: number;  // Position from right (ones, tens, hundreds, etc.)
    digit1: number;          // Digit from first addend
    digit2: number;          // Digit from second addend
    sum: number;             // Sum of digits
    carry: number;           // Carry to next column (0 or 1)
    carryReceived: number;   // Carry received from previous column (0 or 1)
}

export interface AdditionUserAnswer {
    columnPosition: number;
    fieldType: 'sum' | 'carry';
    value: number;
    isCorrect: boolean | null; // null = pending, true = correct, false = incorrect
    timestamp: Date;
}

export interface AdditionGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: AdditionProblem[];
    problem: AdditionProblem | null;
    userAnswers: AdditionUserAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'division' | 'addition';
} 