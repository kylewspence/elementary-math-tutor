// math.ts - Unified types for all math operations
export type MathOperation = 'division' | 'addition' | 'multiplication';

export interface BaseProblem {
    id: string;
    level: number;
    operation: MathOperation;
    isEditable?: boolean;
}

export interface BaseUserAnswer {
    id: string;
    fieldPosition: number;
    value: number;
    isCorrect: boolean;
    timestamp: Date;
}

// Field types for each operation
export type DivisionFieldType = 'quotient' | 'multiply' | 'subtract' | 'bringDown';
export type AdditionFieldType = 'sum' | 'carry';
export type MultiplicationFieldType = 'product' | 'partial' | 'carry';

export type MathFieldType = DivisionFieldType | AdditionFieldType | MultiplicationFieldType;

// Navigation focus for all operations
export interface MathFocus {
    stepNumber?: number;
    fieldType: MathFieldType;
    fieldPosition: number;
    partialIndex?: number; // For multiplication partials
    columnPosition?: number; // For addition columns
}

// Validation types for shared components
export interface ValidationResult {
    isValid: boolean;
    message?: string;
    hint?: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
}

export interface ProblemValidation {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

// Base game state that all operations share
export interface BaseMathGameState<TProblem extends BaseProblem, TAnswer extends BaseUserAnswer> {
    problem: TProblem | null;
    userAnswers: TAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    currentLevel: number;
    score: number;
    isEditable: boolean;
    isLoading?: boolean;
    fetchError?: Error | null;
}

// Keyboard event handling for shared navigation
export interface MathKeyboardEvent {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
}

// Game state actions for consistent state management
export type MathGameAction<TProblem extends BaseProblem, TAnswer extends BaseUserAnswer> =
    | { type: 'SET_PROBLEM'; problem: TProblem }
    | { type: 'ADD_ANSWER'; answer: TAnswer }
    | { type: 'UPDATE_ANSWER'; answerId: string; value: number }
    | { type: 'REMOVE_ANSWER'; answerId: string }
    | { type: 'CLEAR_ANSWERS' }
    | { type: 'SUBMIT_PROBLEM' }
    | { type: 'MARK_COMPLETE' }
    | { type: 'RESET_PROBLEM' }
    | { type: 'SET_LEVEL'; level: number }
    | { type: 'UPDATE_SCORE'; score: number }
    | { type: 'SET_EDITABLE'; isEditable: boolean }
    | { type: 'SET_LOADING'; isLoading: boolean }
    | { type: 'SET_ERROR'; error: Error | null };

// Props that all math display components should accept
export interface BaseMathDisplayProps<TProblem extends BaseProblem, TAnswer extends BaseUserAnswer> {
    problem: TProblem | null;
    userAnswers: TAnswer[];
    currentFocus: MathFocus;
    isSubmitted?: boolean;
    isComplete?: boolean;
    isLoading?: boolean;
    fetchError?: Error | null;
    onAnswerSubmit: (answer: TAnswer) => void;
    onAnswerClear: (answerId?: string) => void;
    onProblemSubmit?: () => void;
    onNextProblem?: () => void;
    onFieldClick: (focus: MathFocus) => void;
    onKeyDown: (e: React.KeyboardEvent, onProblemSubmit?: () => void, onNextProblem?: () => void) => void;
    onEnableEditing?: () => void;
    onDisableEditing?: () => void;
    onUpdateProblem?: (problem: TProblem) => void;
    onResetProblem?: () => void;
    onNewProblem?: () => void;
    onRetryFetch?: () => void;
}

// Hook return types for consistent API across operations
export interface BaseMathGameHook<TProblem extends BaseProblem, TAnswer extends BaseUserAnswer> {
    state: BaseMathGameState<TProblem, TAnswer>;
    actions: {
        setProblem: (problem: TProblem) => void;
        addAnswer: (answer: TAnswer) => void;
        updateAnswer: (answerId: string, value: number) => void;
        removeAnswer: (answerId: string) => void;
        clearAnswers: () => void;
        submitProblem: () => void;
        markComplete: () => void;
        resetProblem: () => void;
        setLevel: (level: number) => void;
        updateScore: (score: number) => void;
        setEditable: (isEditable: boolean) => void;
        setLoading: (isLoading: boolean) => void;
        setError: (error: Error | null) => void;
    };
}

export interface BaseMathKeyboardHook {
    currentFocus: MathFocus;
    setFocus: (focus: MathFocus) => void;
    nextField: () => void;
    previousField: () => void;
    handleKeyDown: (e: React.KeyboardEvent) => boolean;
    registerField: (focus: MathFocus, element: HTMLInputElement | null) => void;
    focusField: (focus: MathFocus) => void;
}

// Re-export existing types but extend them from base types
export interface DivisionStep {
    quotient: number;
    multiply: number;
    subtract: number;
    bringDown?: number;
}

export interface DivisionProblem extends BaseProblem {
    operation: 'division';
    dividend: number;
    divisor: number;
    steps: DivisionStep[];
}

export interface DivisionUserAnswer extends BaseUserAnswer {
    stepNumber: number;
    fieldType: DivisionFieldType;
}

export interface AdditionProblem extends BaseProblem {
    operation: 'addition';
    addends: number[];
    expectedSum: number;
    maxColumns: number;
}

export interface AdditionUserAnswer extends BaseUserAnswer {
    columnPosition: number;
    fieldType: AdditionFieldType;
}

export interface MultiplicationProblem extends BaseProblem {
    operation: 'multiplication';
    multiplicand: number;
    multiplier: number;
    expectedProduct: number;
    partialProducts: number[];
}

export interface MultiplicationUserAnswer extends BaseUserAnswer {
    fieldType: MultiplicationFieldType;
    partialIndex?: number;
}

// Type aliases for specific operations
export type DivisionGameState = BaseMathGameState<DivisionProblem, DivisionUserAnswer>;
export type AdditionGameState = BaseMathGameState<AdditionProblem, AdditionUserAnswer>;
export type MultiplicationGameState = BaseMathGameState<MultiplicationProblem, MultiplicationUserAnswer>;

export type DivisionDisplayProps = BaseMathDisplayProps<DivisionProblem, DivisionUserAnswer>;
export type AdditionDisplayProps = BaseMathDisplayProps<AdditionProblem, AdditionUserAnswer>;
export type MultiplicationDisplayProps = BaseMathDisplayProps<MultiplicationProblem, MultiplicationUserAnswer>;

export type DivisionGameHook = BaseMathGameHook<DivisionProblem, DivisionUserAnswer>;
export type AdditionGameHook = BaseMathGameHook<AdditionProblem, AdditionUserAnswer>;
export type MultiplicationGameHook = BaseMathGameHook<MultiplicationProblem, MultiplicationUserAnswer>; 