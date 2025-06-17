import { useMathKeyboardNav } from './useMathKeyboardNav';
import type { DivisionProblem, UserAnswer } from '../types/game';
import { KEYBOARD_KEYS } from '../utils/constants';

export interface CurrentFocus {
    stepNumber: number;
    fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown';
    fieldPosition: number;
}

export function useKeyboardNav(
    problem: DivisionProblem | null,
    userAnswers: UserAnswer[] = [],
    isSubmitted: boolean = false,
    onProblemSubmit?: () => void
) {
    // Helper to get number of digits needed for a value
    const getDigitCount = (value: number): number => {
        return Math.max(1, value.toString().length);
    };

    // Get all fields in order for navigation
    const getAllFieldsInOrder = () => {
        if (!problem) return [];
        const allFields: CurrentFocus[] = [];
        for (let stepIndex = 0; stepIndex < problem.steps.length; stepIndex++) {
            const step = problem.steps[stepIndex];
            allFields.push({ stepNumber: stepIndex, fieldType: 'quotient', fieldPosition: 0 });
            const multiplyDigits = getDigitCount(step.multiply);
            for (let pos = multiplyDigits - 1; pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'multiply', fieldPosition: pos });
            }
            const subtractDigits = getDigitCount(step.subtract);
            for (let pos = Math.max(0, subtractDigits - 1); pos >= 0; pos--) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'subtract', fieldPosition: pos });
            }
            if (step.bringDown !== undefined) {
                allFields.push({ stepNumber: stepIndex, fieldType: 'bringDown', fieldPosition: 0 });
            }
        }
        return allFields;
    };

    // Use the shared hook
    const nav = useMathKeyboardNav<CurrentFocus>(getAllFieldsInOrder, {
        isSubmitted,
        onProblemSubmit,
        fieldEquals: (a, b) =>
            a.stepNumber === b.stepNumber &&
            a.fieldType === b.fieldType &&
            a.fieldPosition === b.fieldPosition,
    });

    return nav;
} 