// Subtraction types for the Math Tutor app

export interface SubtractionLevel {
    id: number;
    name: string;
    description: string;
    maxDigits: number;
    maxValue: number;
    borrowRequired: boolean;
}

export interface SubtractionProblem {
    minuend: number;         // The number being subtracted from
    subtrahend: number;      // The number being subtracted
    difference: number;      // The result of the subtraction
    steps: SubtractionStep[];
    source?: 'api' | 'local'; // Track if problem came from API or local generation
    isEditable?: boolean;
}

export interface SubtractionStep {
    stepNumber: number;
    columnPosition: number;  // Position from right (ones, tens, hundreds, etc.)
    minuendDigit: number;    // Original digit from minuend
    subtrahendDigit: number; // Digit from subtrahend
    adjustedMinuend: number; // Minuend digit after borrowing adjustments
    difference: number;      // Result of subtraction for this column
    borrowed: number;        // Amount borrowed from next column (0 or 1)
    lentTo: number;         // Amount lent to previous column (0 or 1)
    needsBorrow: boolean;    // Whether this step requires borrowing
}

export interface SubtractionUserAnswer {
    columnPosition: number;
    fieldType: 'difference' | 'borrow' | 'adjusted';
    value: number;
    isCorrect: boolean;
    timestamp: Date;
}

export interface SubtractionCurrentFocus {
    columnPosition: number;
    fieldType: 'difference' | 'borrow' | 'adjusted';
}

export interface SubtractionGameState {
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: SubtractionProblem[];
    problem: SubtractionProblem | null;
    userAnswers: SubtractionUserAnswer[];
    currentFocus: SubtractionCurrentFocus;
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'division' | 'addition' | 'multiplication' | 'subtraction';
} 