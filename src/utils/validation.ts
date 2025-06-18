// Input validation and step validation utilities

import type { UserInput, DivisionState, StepValidation, ValidationError } from '../types/division';
import { DIVISION_CONSTANTS, VALIDATION_MESSAGES } from './constants';
import { validateStepInput, calculateLongDivision } from './divisionCalculator';

// Define type aliases for the navigation and numpad keys
type NavigationKey = typeof DIVISION_CONSTANTS.NAVIGATION_KEYS[number];
type NumpadKey = typeof DIVISION_CONSTANTS.NUMPAD_KEYS[number];

/**
 * Validates numeric input within allowed ranges
 */
export function validateNumericInput(
    value: string | number,
    min: number = DIVISION_CONSTANTS.MIN_DIVISOR,
    max: number = DIVISION_CONSTANTS.MAX_DIVIDEND
): { isValid: boolean; error?: string } {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(numericValue)) {
        return { isValid: false, error: VALIDATION_MESSAGES.ERRORS.INVALID_NUMBER };
    }

    if (numericValue < min || numericValue > max) {
        return { isValid: false, error: VALIDATION_MESSAGES.ERRORS.OUT_OF_RANGE };
    }

    return { isValid: true };
}

/**
 * Validates division by zero
 */
export function validateDivisor(divisor: number): { isValid: boolean; error?: string } {
    if (divisor === 0) {
        return { isValid: false, error: VALIDATION_MESSAGES.ERRORS.DIVISION_BY_ZERO };
    }

    return validateNumericInput(divisor, DIVISION_CONSTANTS.MIN_DIVISOR, DIVISION_CONSTANTS.MAX_DIVISOR);
}

/**
 * Validates dividend input
 */
export function validateDividend(dividend: number): { isValid: boolean; error?: string } {
    return validateNumericInput(dividend, DIVISION_CONSTANTS.MIN_DIVIDEND, DIVISION_CONSTANTS.MAX_DIVIDEND);
}

/**
 * Validates a user's step input against the correct answer
 */
export function validateUserStepInput(input: UserInput, state: DivisionState): StepValidation {
    const { problem } = state;
    const { divisor, dividend } = problem;

    try {
        const isCorrect = validateStepInput(
            divisor,
            dividend,
            input.stepNumber,
            input.fieldType,
            input.value
        );

        const steps = calculateLongDivision(divisor, dividend);
        const expectedStep = steps.find(step =>
            step.stepNumber === input.stepNumber && step.operation === input.fieldType
        );

        const correctValue = expectedStep?.correctAnswer ?? 0;

        return {
            isValid: isCorrect,
            correctValue,
            userValue: input.value,
            message: isCorrect
                ? VALIDATION_MESSAGES.SUCCESS.STEP_CORRECT
                : VALIDATION_MESSAGES.ERRORS.INCORRECT_STEP,
            hint: isCorrect ? undefined : generateHintForStep(input),
        };
    } catch {
        return {
            isValid: false,
            correctValue: 0,
            userValue: input.value,
            message: VALIDATION_MESSAGES.ERRORS.INCORRECT_STEP,
            hint: 'Please check your calculation and try again.',
        };
    }
}

/**
 * Generates contextual hints for a specific step
 */
export function generateHintForStep(_input: UserInput): string {
    const { fieldType } = _input;

    switch (fieldType) {
        case 'quotient':
            return VALIDATION_MESSAGES.HINTS.FIRST_DIGIT;
        case 'multiply':
            return VALIDATION_MESSAGES.HINTS.MULTIPLY;
        case 'subtract':
            return VALIDATION_MESSAGES.HINTS.SUBTRACT;
        case 'bringDown':
            return VALIDATION_MESSAGES.HINTS.BRING_DOWN;
        default:
            return VALIDATION_MESSAGES.HINTS.CHECK_WORK;
    }
}

/**
 * Validates the overall problem state for completion
 */
export function validateProblemCompletion(state: DivisionState): {
    isComplete: boolean;
    hasErrors: boolean;
    completionMessage?: string;
} {
    const { problem, userInputs, errors } = state;
    const allSteps = calculateLongDivision(problem.divisor, problem.dividend);

    const hasErrors = errors.some(error => error.severity === 'error');
    const completedSteps = userInputs.filter(input => {
        const validation = validateUserStepInput(input, state);
        return validation.isValid;
    }).length;

    const isComplete = completedSteps >= allSteps.length && !hasErrors;

    return {
        isComplete,
        hasErrors,
        completionMessage: isComplete ? VALIDATION_MESSAGES.SUCCESS.PROBLEM_COMPLETE : undefined,
    };
}

/**
 * Validates keyboard input for numeric fields
 */
export function validateKeyboardInput(
    key: string,
    currentValue: string,
    maxLength: number = 4
): { isAllowed: boolean; shouldPreventDefault?: boolean } {
    // Allow navigation keys
    if (DIVISION_CONSTANTS.NAVIGATION_KEYS.includes(key as NavigationKey)) {
        return { isAllowed: true };
    }

    // Allow numeric keys
    if (DIVISION_CONSTANTS.NUMPAD_KEYS.includes(key as NumpadKey)) {
        // Prevent input if at max length
        if (currentValue.length >= maxLength) {
            return { isAllowed: false, shouldPreventDefault: true };
        }
        return { isAllowed: true };
    }

    // Block all other keys
    return { isAllowed: false, shouldPreventDefault: true };
}

/**
 * Sanitizes user input for numeric fields
 */
export function sanitizeNumericInput(input: string): string {
    // Remove all non-numeric characters
    const numeric = input.replace(/[^0-9]/g, '');

    // Limit to reasonable length
    return numeric.slice(0, 4);
}

/**
 * Creates a validation error object
 */
export function createValidationError(
    stepNumber: number,
    fieldType: string,
    position: number,
    message: string,
    severity: 'error' | 'warning' | 'hint' = 'error'
): ValidationError {
    return {
        stepNumber,
        fieldType,
        position,
        message,
        severity,
    };
}

/**
 * Checks if all required fields for a step are filled
 */
export function validateStepCompletion(
    stepNumber: number,
    state: DivisionState
): { isComplete: boolean; missingFields: string[] } {
    const stepInputs = state.userInputs.filter(input => input.stepNumber === stepNumber);
    const requiredFields = ['quotient', 'multiply', 'subtract'];

    const missingFields = requiredFields.filter(fieldType =>
        !stepInputs.some(input => input.fieldType === fieldType)
    );

    return {
        isComplete: missingFields.length === 0,
        missingFields,
    };
}

/**
 * Formats validation messages for user display
 */
export function formatValidationMessage(validation: StepValidation): string {
    let message = validation.message || '';

    if (!validation.isValid && validation.correctValue !== undefined) {
        message += ` The correct answer is ${validation.correctValue}.`;
    }

    if (validation.hint) {
        message += ` Hint: ${validation.hint}`;
    }

    return message;
}

/**
 * Determines if input should trigger automatic focus advancement
 */
export function shouldAutoAdvanceFocus(
    _input: UserInput,
    validation: StepValidation,
    settings: { autoAdvance: boolean }
): boolean {
    return settings.autoAdvance && validation.isValid;
}

/**
 * Shared utility functions for validation across math operations
 */

/**
 * Generic function to check if all required fields have answers
 * @param userAnswers - Array of user answers
 * @param requiredFields - Array of required field descriptors
 * @returns true if all required fields have answers
 */
export function areAllFieldsFilled<T extends { fieldType: string;[key: string]: unknown }>(
    userAnswers: T[],
    requiredFields: Array<{ fieldType: string; fieldPosition: number; partialIndex?: number }>
): boolean {
    if (!userAnswers.length) return false;

    return requiredFields.every(field => {
        return userAnswers.some(answer => {
            // Handle different field matching patterns for different operations
            if ('columnPosition' in answer) {
                // Addition/Division style
                return answer.columnPosition === field.fieldPosition &&
                    answer.fieldType === field.fieldType;
            } else if ('fieldPosition' in answer) {
                // Multiplication style  
                return answer.fieldPosition === field.fieldPosition &&
                    answer.fieldType === field.fieldType &&
                    answer.partialIndex === field.partialIndex;
            }
            return false;
        });
    });
} 