// Application constants and configuration values

import type { GameLevel } from '../types/game';

export const DIVISION_CONSTANTS = {
    // Input validation
    MIN_DIVISOR: 1,
    MAX_DIVISOR: 999,
    MIN_DIVIDEND: 1,
    MAX_DIVIDEND: 9999,

    // UI settings
    MAX_QUOTIENT_DIGITS: 6,
    MAX_WORKING_ROWS: 10,
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
        RESET_BUTTON: 'Reset problem',
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
    },
    {
        id: 2,
        name: 'Level 2',
        description: 'Single digit divisor, 3-digit dividend',
        divisorDigits: 1,
        dividendDigits: 3,
        maxDivisor: 9,
        maxDividend: 999,
    },
    {
        id: 3,
        name: 'Level 3',
        description: 'Single digit divisor, 4-digit dividend',
        divisorDigits: 1,
        dividendDigits: 4,
        maxDivisor: 9,
        maxDividend: 9999,
    },
    {
        id: 4,
        name: 'Level 4',
        description: 'Two digit divisor, 3-4 digit dividend',
        divisorDigits: 2,
        dividendDigits: 4,
        maxDivisor: 99,
        maxDividend: 9999,
    },
];

export const PROBLEMS_PER_LEVEL = 10;

export const UI_COLORS = {
    CORRECT: 'bg-green-100 border-green-400 text-green-800',
    ERROR: 'bg-red-100 border-red-400 text-red-800',
    ACTIVE: 'bg-blue-100 border-blue-400 ring-2 ring-blue-300',
    DEFAULT: 'bg-white border-gray-300 text-gray-800',
};

export const KEYBOARD_KEYS = {
    TAB: 'Tab',
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    BACKSPACE: 'Backspace',
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