import { useCallback } from 'react';

export interface ValidationField {
    stepNumber?: number;
    fieldType: string;
    fieldPosition?: number;
    partialIndex?: number;
    columnPosition?: number;
}

export interface ValidationAnswer {
    stepNumber?: number;
    fieldType: string;
    fieldPosition?: number;
    partialIndex?: number;
    columnPosition?: number;
    value?: number;
}

export function useSharedValidation() {
    // Generic validation function that works for all math operations
    const areAllFieldsFilled = useCallback((
        allFields: ValidationField[],
        userAnswers: ValidationAnswer[]
    ): boolean => {
        if (allFields.length === 0) return false;

        // Check if we have an answer for each field
        return allFields.every(field => {
            return userAnswers.some(answer => {
                // Division/Addition fields (stepNumber + fieldType + fieldPosition)
                if (field.stepNumber !== undefined && field.fieldPosition !== undefined) {
                    return answer.stepNumber === field.stepNumber &&
                        answer.fieldType === field.fieldType &&
                        answer.fieldPosition === field.fieldPosition;
                }

                // Multiplication fields (has fieldPosition but no stepNumber)
                if (field.fieldPosition !== undefined && field.stepNumber === undefined) {
                    return answer.fieldType === field.fieldType &&
                        answer.fieldPosition === field.fieldPosition &&
                        answer.partialIndex === field.partialIndex;
                }

                // Addition fields (columnPosition + fieldType)
                if (field.columnPosition !== undefined) {
                    return answer.columnPosition === field.columnPosition &&
                        answer.fieldType === field.fieldType;
                }

                return false;
            });
        });
    }, []);

    return {
        areAllFieldsFilled
    };
} 