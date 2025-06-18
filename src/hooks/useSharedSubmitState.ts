import { useState, useEffect, useCallback } from 'react';
import { useSharedValidation } from './useSharedValidation';
import type { ValidationField, ValidationAnswer } from './useSharedValidation';

export function useSharedSubmitState<TField, TAnswer, TProblem>(
    problem: TProblem | null,
    userAnswers: TAnswer[],
    getAllFields: () => TField[],
    convertFieldToValidation: (field: TField) => ValidationField,
    convertAnswerToValidation: (answer: TAnswer) => ValidationAnswer
) {
    const [allFieldsFilled, setAllFieldsFilled] = useState<boolean>(false);
    const { areAllFieldsFilled } = useSharedValidation();

    // Calculate if all fields are filled
    const calculateAllFieldsFilled = useCallback(() => {
        if (!problem) return false;

        const allFields = getAllFields();

        // Convert to validation format
        const validationFields = allFields.map(convertFieldToValidation);
        const validationAnswers = userAnswers.map(convertAnswerToValidation);

        return areAllFieldsFilled(validationFields, validationAnswers);
    }, [problem, userAnswers, getAllFields, convertFieldToValidation, convertAnswerToValidation, areAllFieldsFilled]);

    // Update state when dependencies change
    useEffect(() => {
        const allFilled = calculateAllFieldsFilled();
        setAllFieldsFilled(allFilled);
    }, [calculateAllFieldsFilled]);

    // Reset when problem changes
    useEffect(() => {
        if (!problem) {
            setAllFieldsFilled(false);
        }
    }, [problem]);

    return {
        allFieldsFilled,
        calculateAllFieldsFilled
    };
} 