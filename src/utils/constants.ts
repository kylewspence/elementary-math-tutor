// Application constants and configuration values

import type { GameLevel } from '../types/game';
import type { AdditionLevel } from '../types/addition';
import type { MultiplicationLevel } from '../types/multiplication';


export const DIVISION_CONSTANTS = {
    // Input validation
    MIN_DIVISOR: 1,
    MAX_DIVISOR: 9999,
    MIN_DIVIDEND: 1,
    MAX_DIVIDEND: 999999,

    // UI settings
    MAX_QUOTIENT_DIGITS: 8,
    MAX_WORKING_ROWS: 15,
    INPUT_DEBOUNCE_MS: 300,

    // Keyboard navigation
    NUMPAD_KEYS: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    NAVIGATION_KEYS: ['Tab', 'Enter', 'Escape', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],

    // Problem generation
    DEFAULT_PROBLEM_SETTINGS: {
        beginner: {
            minDivisor: 2,
            maxDivisor: 9,
            minDividend: 10,
            maxDividend: 99,
            allowRemainders: false,
        },
        intermediate: {
            minDivisor: 10,
            maxDivisor: 99,
            minDividend: 100,
            maxDividend: 999,
            allowRemainders: true,
        },
        advanced: {
            minDivisor: 10,
            maxDivisor: 99,
            minDividend: 1000,
            maxDividend: 9999,
            allowRemainders: true,
        },
    },
} as const;

export const UI_CONSTANTS = {
    // Colors for validation feedback
    COLORS: {
        SUCCESS: 'bg-green-100 border-green-300 text-green-800',
        ERROR: 'bg-red-100 border-red-300 text-red-800',
        WARNING: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        NEUTRAL: 'bg-gray-100 border-gray-300 text-gray-800',
        FOCUS: 'ring-2 ring-blue-500 ring-opacity-50',
    },

    // Animation durations
    TRANSITIONS: {
        FAST: 'transition-all duration-150',
        NORMAL: 'transition-all duration-300',
        SLOW: 'transition-all duration-500',
    },

    // Layout dimensions
    LAYOUT: {
        INPUT_WIDTH: 'w-12',
        INPUT_HEIGHT: 'h-10',
        BUTTON_HEIGHT: 'h-12',
        CONTAINER_MAX_WIDTH: 'max-w-4xl',
    },
} as const;

export const VALIDATION_MESSAGES = {
    ERRORS: {
        DIVISION_BY_ZERO: 'Cannot divide by zero',
        INVALID_NUMBER: 'Please enter a valid number',
        OUT_OF_RANGE: 'Number is out of allowed range',
        INCORRECT_STEP: 'This step is incorrect',
        EMPTY_FIELD: 'This field cannot be empty',
    },

    HINTS: {
        FIRST_DIGIT: 'Look at the first digit(s) of the dividend',
        MULTIPLY: 'Multiply the quotient digit by the divisor',
        SUBTRACT: 'Subtract the multiplication result from the dividend portion',
        BRING_DOWN: 'Bring down the next digit from the dividend',
        CHECK_WORK: 'Double-check your multiplication and subtraction',
    },

    SUCCESS: {
        STEP_CORRECT: 'Correct! Moving to next step.',
        PROBLEM_COMPLETE: 'Excellent! You completed the division problem.',
        GOOD_PROGRESS: 'Great work! Keep going.',
    },
} as const;

export const KEYBOARD_SHORTCUTS = {
    NAVIGATION: {
        NEXT_FIELD: 'Tab',
        PREVIOUS_FIELD: 'Shift+Tab',
        SUBMIT_STEP: 'Enter',
        CANCEL_STEP: 'Escape',
        RESET_PROBLEM: 'Ctrl+R',
        NEW_PROBLEM: 'Ctrl+N',
        TOGGLE_HINTS: 'Ctrl+H',
    },

    HELP_TEXT: {
        'Tab': 'Move to next field',
        'Shift+Tab': 'Move to previous field',
        'Enter': 'Submit current step',
        'Escape': 'Cancel current input',
        'Ctrl+R': 'Reset current problem',
        'Ctrl+N': 'Generate new problem',
        'Ctrl+H': 'Toggle hints',
    },
} as const;

export const PROBLEM_EXAMPLES = {
    BEGINNER: [
        { divisor: 3, dividend: 96 },
        { divisor: 4, dividend: 84 },
        { divisor: 6, dividend: 78 },
        { divisor: 7, dividend: 91 },
        { divisor: 8, dividend: 96 },
    ],

    INTERMEDIATE: [
        { divisor: 12, dividend: 156 },
        { divisor: 23, dividend: 368 },
        { divisor: 34, dividend: 578 },
        { divisor: 45, dividend: 765 },
        { divisor: 56, dividend: 896 },
    ],

    ADVANCED: [
        { divisor: 67, dividend: 2814 },
        { divisor: 78, dividend: 3978 },
        { divisor: 89, dividend: 5607 },
        { divisor: 123, dividend: 7890 },
        { divisor: 234, dividend: 9876 },
    ],
} as const;

export const ACCESSIBILITY = {
    ARIA_LABELS: {
        DIVISOR_INPUT: 'Enter the divisor (number to divide by)',
        DIVIDEND_INPUT: 'Enter the dividend (number being divided)',
        QUOTIENT_DIGIT: 'Quotient digit',
        MULTIPLY_RESULT: 'Multiplication result',
        SUBTRACT_RESULT: 'Subtraction result',
        BRING_DOWN_DIGIT: 'Bring down digit',
        SUBMIT_BUTTON: 'Submit current step',
        NEW_PROBLEM_BUTTON: 'Generate new problem',
        HINT_BUTTON: 'Show hint for current step',
    },

    SCREEN_READER_MESSAGES: {
        STEP_COMPLETED: 'Step completed correctly',
        STEP_ERROR: 'Step contains an error',
        PROBLEM_STARTED: 'New division problem started',
        PROBLEM_COMPLETED: 'Division problem completed successfully',
        FOCUS_MOVED: 'Focus moved to next field',
    },
} as const;

// Type-safe constant exports
export type DifficultyLevel = keyof typeof DIVISION_CONSTANTS.DEFAULT_PROBLEM_SETTINGS;
export type ValidationMessageType = keyof typeof VALIDATION_MESSAGES;
export type KeyboardShortcut = keyof typeof KEYBOARD_SHORTCUTS.NAVIGATION;

export const GAME_LEVELS: GameLevel[] = [
    {
        id: 1,
        name: 'Level 1',
        description: 'Single digit divisor, 2-digit dividend',
        divisorDigits: 1,
        dividendDigits: 2,
        maxDivisor: 9,
        maxDividend: 99,
        minDigits: 1,
        maxDigits: 1,
    },
    {
        id: 2,
        name: 'Level 2',
        description: 'Single digit divisor, 3-digit dividend',
        divisorDigits: 1,
        dividendDigits: 3,
        maxDivisor: 9,
        maxDividend: 999,
        minDigits: 1,
        maxDigits: 2,
    },
    {
        id: 3,
        name: 'Level 3',
        description: 'Single digit divisor, 4-digit dividend',
        divisorDigits: 1,
        dividendDigits: 4,
        maxDivisor: 9,
        maxDividend: 9999,
        minDigits: 2,
        maxDigits: 2,
    },
    {
        id: 4,
        name: 'Level 4',
        description: 'Two digit divisor, 3-digit dividend',
        divisorDigits: 2,
        dividendDigits: 3,
        maxDivisor: 99,
        maxDividend: 999,
        minDigits: 2,
        maxDigits: 2,
    },
    {
        id: 5,
        name: 'Level 5',
        description: 'Two digit divisor, 4-digit dividend',
        divisorDigits: 2,
        dividendDigits: 4,
        maxDivisor: 99,
        maxDividend: 9999,
        minDigits: 2,
        maxDigits: 3,
    },
    {
        id: 6,
        name: 'Level 6',
        description: 'Two digit divisor, 5-digit dividend',
        divisorDigits: 2,
        dividendDigits: 5,
        maxDivisor: 99,
        maxDividend: 99999,
        minDigits: 2,
        maxDigits: 3,
    },
    {
        id: 7,
        name: 'Level 7',
        description: 'Three digit divisor, 4-digit dividend',
        divisorDigits: 3,
        dividendDigits: 4,
        maxDivisor: 999,
        maxDividend: 9999,
        minDigits: 3,
        maxDigits: 3,
    },
    {
        id: 8,
        name: 'Level 8',
        description: 'Three digit divisor, 5-digit dividend',
        divisorDigits: 3,
        dividendDigits: 5,
        maxDivisor: 999,
        maxDividend: 99999,
        minDigits: 3,
        maxDigits: 3,
    },
    {
        id: 9,
        name: 'Level 9',
        description: 'Three digit divisor, 6-digit dividend',
        divisorDigits: 3,
        dividendDigits: 6,
        maxDivisor: 999,
        maxDividend: 999999,
        minDigits: 3,
        maxDigits: 4,
    },
    {
        id: 10,
        name: 'Level 10',
        description: 'Custom problem',
        divisorDigits: 4,
        dividendDigits: 6,
        maxDivisor: 9999,
        maxDividend: 999999,
        minDigits: 4,
        maxDigits: 4,
    },
];

export const PROBLEMS_PER_LEVEL = 10;

export const UI_COLORS = {
    CORRECT: 'bg-green-100 border-green-400 text-green-800',
    ERROR: 'bg-red-100 border-red-400 text-red-800',
    ACTIVE: 'bg-blue-100 border-blue-400 ring-2 ring-blue-300',
    DEFAULT: 'bg-white border-gray-300 text-gray-800',
};

export const GRID_CONSTANTS = {
    BOX_WIDTH: 40, // Width of each input box in pixels
    BOX_HEIGHT: 40, // Height of each input box in pixels
    BOX_GAP: 8, // Gap between boxes in pixels
    BOX_TOTAL_WIDTH: 48, // Total width including gap (BOX_WIDTH + BOX_GAP)
};

export const KEYBOARD_KEYS = {
    TAB: 'Tab',
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
};

export const FIELD_TYPES = {
    QUOTIENT: 'quotient',
    MULTIPLY: 'multiply',
    SUBTRACT: 'subtract',
} as const;

// Addition levels
export const ADDITION_LEVELS: AdditionLevel[] = [
    {
        id: 1,
        name: 'Level 1',
        description: 'Single digit addition, no carrying',
        maxDigits: 1,
        maxValue: 9,
        carryRequired: false,
    },
    {
        id: 2,
        name: 'Level 2',
        description: 'Single digit addition with carrying',
        maxDigits: 1,
        maxValue: 9,
        carryRequired: true,
    },
    {
        id: 3,
        name: 'Level 3',
        description: 'Two-digit addition, no carrying',
        maxDigits: 2,
        maxValue: 99,
        carryRequired: false,
    },
    {
        id: 4,
        name: 'Level 4',
        description: 'Two-digit addition with carrying',
        maxDigits: 2,
        maxValue: 99,
        carryRequired: true,
    },
    {
        id: 5,
        name: 'Level 5',
        description: 'Three-digit addition, no carrying',
        maxDigits: 3,
        maxValue: 999,
        carryRequired: false,
    },
    {
        id: 6,
        name: 'Level 6',
        description: 'Three-digit addition with carrying',
        maxDigits: 3,
        maxValue: 999,
        carryRequired: true,
    },
    {
        id: 7,
        name: 'Level 7',
        description: 'Four-digit addition, no carrying',
        maxDigits: 4,
        maxValue: 9999,
        carryRequired: false,
    },
    {
        id: 8,
        name: 'Level 8',
        description: 'Four-digit addition with carrying',
        maxDigits: 4,
        maxValue: 9999,
        carryRequired: true,
    },
    {
        id: 9,
        name: 'Level 9',
        description: 'Five-digit addition, no carrying',
        maxDigits: 5,
        maxValue: 99999,
        carryRequired: false,
    },
    {
        id: 10,
        name: 'Level 10',
        description: 'Five-digit addition with carrying',
        maxDigits: 5,
        maxValue: 99999,
        carryRequired: true,
    },
];

// Multiplication levels
export const MULTIPLICATION_LEVELS: MultiplicationLevel[] = [
    {
        id: 1,
        name: 'Level 1',
        description: 'Single digit × single digit',
        multiplicandDigits: 1,
        multiplierDigits: 1,
        difficulty: 'easy',
    },
    {
        id: 2,
        name: 'Level 2',
        description: 'Two digit × single digit',
        multiplicandDigits: 2,
        multiplierDigits: 1,
        difficulty: 'easy',
    },
    {
        id: 3,
        name: 'Level 3',
        description: 'Three digit × single digit',
        multiplicandDigits: 3,
        multiplierDigits: 1,
        difficulty: 'medium',
    },
    {
        id: 4,
        name: 'Level 4',
        description: 'Two digit × two digit',
        multiplicandDigits: 2,
        multiplierDigits: 2,
        difficulty: 'medium',
    },
    {
        id: 5,
        name: 'Level 5',
        description: 'Three digit × two digit',
        multiplicandDigits: 3,
        multiplierDigits: 2,
        difficulty: 'hard',
    },
    {
        id: 6,
        name: 'Level 6',
        description: 'Four digit × two digit',
        multiplicandDigits: 4,
        multiplierDigits: 2,
        difficulty: 'hard',
    },
    {
        id: 7,
        name: 'Level 7',
        description: 'Three digit × three digit',
        multiplicandDigits: 3,
        multiplierDigits: 3,
        difficulty: 'expert',
    },
    {
        id: 8,
        name: 'Level 8',
        description: 'Four digit × three digit',
        multiplicandDigits: 4,
        multiplierDigits: 3,
        difficulty: 'expert',
    },
    {
        id: 9,
        name: 'Level 9',
        description: 'Five digit × three digit',
        multiplicandDigits: 5,
        multiplierDigits: 3,
        difficulty: 'expert',
    },
    {
        id: 10,
        name: 'Level 10',
        description: 'Custom problem',
        multiplicandDigits: 5,
        multiplierDigits: 4,
        difficulty: 'expert',
    },
];

// Configuration for different difficulty levels
export const DIFFICULTY_CONFIG = {
    multiplication: {
        easy: {
            multiplicandDigits: 2,
            multiplierDigits: 1,
        },
        medium: {
            multiplicandDigits: 2,
            multiplierDigits: 2,
        },
        hard: {
            multiplicandDigits: 3,
            multiplierDigits: 2,
        },
        expert: {
            multiplicandDigits: 3,
            multiplierDigits: 3,
        },
    },
} as const; 