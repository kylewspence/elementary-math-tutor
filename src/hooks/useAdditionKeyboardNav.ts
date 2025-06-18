import { useCallback } from 'react';
import { useMathKeyboardNav } from './useMathKeyboardNav';
import type { AdditionProblem, AdditionUserAnswer } from '../types/addition';


export interface AdditionCurrentFocus {
    columnPosition: number;
    fieldType: 'sum' | 'carry';
}

export function useAdditionKeyboardNav(
    problem: AdditionProblem | null,
    _userAnswers?: AdditionUserAnswer[],
    isSubmitted: boolean = false,
    onProblemSubmit?: () => void
) {
    // Check if we need an extra box for the final carry
    const hasExtraBox = (() => {
        if (!problem) return false;
        const maxAddendDigits = Math.max(
            problem.addend1.toString().length,
            problem.addend2.toString().length
        );
        return problem.sum > Math.pow(10, maxAddendDigits) - 1;
    })();

    // Get all fields in the order they should be navigated
    const getAllFields = useCallback(() => {
        if (!problem) return [];
        const fields: AdditionCurrentFocus[] = [];
        const orderedSteps = [...problem.steps].sort((a, b) => a.columnPosition - b.columnPosition);
        for (const step of orderedSteps) {
            fields.push({ columnPosition: step.columnPosition, fieldType: 'sum' });
            if (step.carry > 0) {
                const nextColumnPosition = step.columnPosition + 1;
                fields.push({ columnPosition: nextColumnPosition, fieldType: 'carry' });
            }
        }
        if (hasExtraBox) {
            fields.push({ columnPosition: problem.steps.length, fieldType: 'sum' });
        }
        return fields;
    }, [problem, hasExtraBox]);

    // Use the shared hook
    const nav = useMathKeyboardNav<AdditionCurrentFocus>(getAllFields, {
        isSubmitted,
        onProblemSubmit,
        fieldEquals: (a, b) =>
            a.columnPosition === b.columnPosition &&
            a.fieldType === b.fieldType,
    });

    // Override moveNext with moveNextNoWrap for auto-advance
    return {
        ...nav,
        moveNext: nav.moveNextNoWrap, // Use no-wrap version for auto-advance
    };
} 