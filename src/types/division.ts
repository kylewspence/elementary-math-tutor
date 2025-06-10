// Division tutor type definitions

export interface DivisionProblem {
    divisor: number;
    dividend: number;
    quotient?: number;
    remainder?: number;
}

export interface DivisionStep {
    stepNumber: number;
    operation: 'divide' | 'multiply' | 'subtract' | 'bringDown';
    value: number;
    position: number;
    isCorrect?: boolean;
    userInput?: number;
    correctAnswer: number;
}

export interface UserInput {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    position: number;
    value: number;
    timestamp: Date;
}

export interface DivisionState {
    problem: DivisionProblem;
    currentStep: number;
    totalSteps: number;
    quotientDigits: (number | null)[];
    workingArea: DivisionWorkingArea;
    userInputs: UserInput[];
    isComplete: boolean;
    errors: ValidationError[];
    hints: string[];
}

export interface DivisionWorkingArea {
    multiplyResults: { [stepIndex: number]: number | null };
    subtractResults: { [stepIndex: number]: number | null };
    bringDownDigits: { [stepIndex: number]: number | null };
    remainders: (number | null)[];
}

export interface ValidationError {
    stepNumber: number;
    fieldType: string;
    position: number;
    message: string;
    severity: 'error' | 'warning' | 'hint';
}

export interface FocusPosition {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    position: number;
}

export interface KeyboardEvent {
    key: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
}

export interface DivisionSettings {
    showHints: boolean;
    autoAdvance: boolean;
    highlightErrors: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    soundEnabled: boolean;
}

export interface StepValidation {
    isValid: boolean;
    correctValue: number;
    userValue: number;
    message?: string;
    hint?: string;
}

// Utility types
export type DivisionEventType =
    | 'problem_started'
    | 'step_completed'
    | 'step_failed'
    | 'problem_completed'
    | 'hint_requested'
    | 'problem_reset';

export interface DivisionEvent {
    type: DivisionEventType;
    timestamp: Date;
    data: Record<string, any>;
}

export interface ProblemGenerator {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    minDivisor: number;
    maxDivisor: number;
    minDividend: number;
    maxDividend: number;
    allowRemainders: boolean;
}

// Component prop types
export interface DivisionLayoutProps {
    state: DivisionState;
    onStepComplete: (step: DivisionStep) => void;
    onInputChange: (input: UserInput) => void;
    onFocusChange: (position: FocusPosition) => void;
}

export interface InputFieldProps {
    value: number | null;
    position: FocusPosition;
    isActive: boolean;
    isCorrect?: boolean;
    isError?: boolean;
    placeholder?: string;
    onChange: (value: number) => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (event: KeyboardEvent) => boolean;
}

export interface ValidationFeedbackProps {
    validation: StepValidation;
    showHint: boolean;
    onHintToggle: () => void;
}

export interface ProblemInputProps {
    problem: DivisionProblem;
    onChange: (problem: DivisionProblem) => void;
    onGenerate: () => void;
    disabled?: boolean;
}

// Hook return types
export interface UseDivisionLogicReturn {
    state: DivisionState;
    startProblem: (problem: DivisionProblem) => void;
    submitStep: (input: UserInput) => void;
    resetProblem: () => void;
    generateProblem: (settings?: ProblemGenerator) => DivisionProblem;
    validateStep: (input: UserInput) => StepValidation;
}

export interface UseKeyboardNavigationReturn {
    currentFocus: FocusPosition;
    nextField: () => void;
    previousField: () => void;
    jumpToField: (position: FocusPosition) => void;
    handleKeyDown: (event: KeyboardEvent) => boolean;
    registerField: (position: FocusPosition, element: HTMLInputElement | null) => void;
    focusField: (position: FocusPosition) => void;
}

export interface UseValidationReturn {
    validateInput: (input: UserInput, state: DivisionState) => StepValidation;
    getHint: (stepNumber: number, state: DivisionState) => string;
    checkCompletion: (state: DivisionState) => boolean;
} 