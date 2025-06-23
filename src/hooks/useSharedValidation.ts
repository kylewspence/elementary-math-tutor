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
        console.log('🔍 [SHARED VALIDATION] areAllFieldsFilled called:');
        console.log('  All fields:', allFields);
        console.log('  User answers:', userAnswers);

        if (allFields.length === 0) {
            console.log('  ❌ No fields to validate - returning false');
            return false;
        }

        // Check if we have an answer for each field
        const result = allFields.every(field => {
            const hasAnswer = userAnswers.some(answer => {
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

            if (!hasAnswer) {
                console.log(`  ❌ Missing answer for field:`, field);
            }

            return hasAnswer;
        });

        console.log(`  Final result: ${result}`);
        return result;
    }, []);

    return {
        areAllFieldsFilled
    };
} 