import { useState, useCallback } from 'react';
import type {
    DivisionState,
    DivisionProblem,
    UserInput,
    StepValidation,
    UseDivisionLogicReturn,
    ProblemGenerator
} from '../types/division';
import {
    calculateLongDivision,
    generateRandomProblem
} from '../utils/divisionCalculator';
import { validateUserStepInput, validateProblemCompletion } from '../utils/validation';

export function useDivisionLogic(): UseDivisionLogicReturn {
    const [state, setState] = useState<DivisionState>({
        problem: { divisor: 53, dividend: 1006 },
        currentStep: 0,
        totalSteps: 0,
        quotientDigits: [],
        workingArea: {
            multiplyResults: {},
            subtractResults: {},
            bringDownDigits: {},
            remainders: [],
        },
        userInputs: [],
        isComplete: false,
        errors: [],
        hints: [],
    });

    const startProblem = useCallback((problem: DivisionProblem) => {
        const steps = calculateLongDivision(problem.divisor, problem.dividend);
        const quotientSteps = steps.filter(step => step.operation === 'divide');

        setState({
            problem,
            currentStep: 0,
            totalSteps: steps.length,
            quotientDigits: new Array(quotientSteps.length).fill(null),
            workingArea: {
                multiplyResults: {},
                subtractResults: {},
                bringDownDigits: {},
                remainders: [],
            },
            userInputs: [],
            isComplete: false,
            errors: [],
            hints: [],
        });
    }, []);

    const submitStep = useCallback((input: UserInput) => {
        setState(prevState => {
            const validation = validateUserStepInput(input, prevState);
            const newUserInputs = [...prevState.userInputs, input];

            // Update the appropriate working area based on field type
            const newWorkingArea = { ...prevState.workingArea };
            const newQuotientDigits = [...prevState.quotientDigits];

            if (input.fieldType === 'quotient') {
                newQuotientDigits[input.position] = input.value;
            } else if (input.fieldType === 'multiply') {
                newWorkingArea.multiplyResults = { ...newWorkingArea.multiplyResults, [input.stepNumber]: input.value };
            } else if (input.fieldType === 'subtract') {
                newWorkingArea.subtractResults = { ...newWorkingArea.subtractResults, [input.stepNumber]: input.value };
            } else if (input.fieldType === 'bringDown') {
                newWorkingArea.bringDownDigits = { ...newWorkingArea.bringDownDigits, [input.stepNumber]: input.value };
            }

            // Update errors
            const newErrors = prevState.errors.filter(
                error => !(error.stepNumber === input.stepNumber && error.fieldType === input.fieldType)
            );

            if (!validation.isValid) {
                newErrors.push({
                    stepNumber: input.stepNumber,
                    fieldType: input.fieldType,
                    position: input.position,
                    message: validation.message || 'Incorrect value',
                    severity: 'error' as const,
                });
            }

            // Check if problem is complete
            const updatedState = {
                ...prevState,
                userInputs: newUserInputs,
                quotientDigits: newQuotientDigits,
                workingArea: newWorkingArea,
                errors: newErrors,
                currentStep: validation.isValid ? prevState.currentStep + 1 : prevState.currentStep,
            };

            const completion = validateProblemCompletion(updatedState);

            return {
                ...updatedState,
                isComplete: completion.isComplete,
            };
        });
    }, []);

    const resetProblem = useCallback(() => {
        setState(prevState => ({
            ...prevState,
            currentStep: 0,
            quotientDigits: new Array(prevState.quotientDigits.length).fill(null),
            workingArea: {
                multiplyResults: {},
                subtractResults: {},
                bringDownDigits: {},
                remainders: [],
            },
            userInputs: [],
            isComplete: false,
            errors: [],
            hints: [],
        }));
    }, []);

    const generateProblem = useCallback((settings?: ProblemGenerator): DivisionProblem => {
        return generateRandomProblem(settings);
    }, []);

    const validateStep = useCallback((input: UserInput): StepValidation => {
        return validateUserStepInput(input, state);
    }, [state]);

    return {
        state,
        startProblem,
        submitStep,
        resetProblem,
        generateProblem,
        validateStep,
    };
} 