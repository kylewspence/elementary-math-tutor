import React from 'react';
import type { MultiplicationProblem, MultiplicationUserAnswer } from '../../types/multiplication';
import MultiplicationDisplay from './MultiplicationDisplay';
import { useMultiplicationKeyboardNav } from '../../hooks/useMultiplicationKeyboardNav';

interface MultiplicationLayoutProps {
    problem: MultiplicationProblem | null;
    userAnswers: MultiplicationUserAnswer[];
    isSubmitted: boolean;
    isComplete: boolean;
    onSubmitAnswer: (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
    onSubmitProblem: () => void;
    onNextProblem: () => void;
    onResetProblem: () => void;
    onNewProblem: () => void;
    onEnableEditing: () => void;
    onDisableEditing: () => void;
    onUpdateProblem?: (multiplicand: number, multiplier: number) => void;
    onAnswerClear: (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => void;
}

const MultiplicationLayout: React.FC<MultiplicationLayoutProps> = (props) => {
    // Use the keyboard navigation hook
    const {
        currentFocus,
        handleKeyDown,
        jumpToField
    } = useMultiplicationKeyboardNav(
        props.problem,
        props.userAnswers,
        props.isSubmitted
    );

    // Handle field click to set focus
    const handleFieldClick = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        jumpToField(fieldType, position, partialIndex);
    };

    // Handle keyboard events
    const handleKeyboardEvents = (e: React.KeyboardEvent) => {
        handleKeyDown(e, props.onSubmitProblem);
    };

    return (
        <MultiplicationDisplay
            problem={props.problem}
            userAnswers={props.userAnswers}
            currentFocus={currentFocus}
            onFieldClick={handleFieldClick}
            onKeyDown={handleKeyboardEvents}
            isSubmitted={props.isSubmitted}
            isComplete={props.isComplete}
            onAnswerSubmit={props.onSubmitAnswer}
            onAnswerClear={props.onAnswerClear}
            onProblemSubmit={props.onSubmitProblem}
            onNextProblem={props.onNextProblem}
            onResetProblem={props.onResetProblem}
            onNewProblem={props.onNewProblem}
            onEnableEditing={props.onEnableEditing}
            onDisableEditing={props.onDisableEditing}
            onUpdateProblem={props.onUpdateProblem}

        />
    );
};

export default MultiplicationLayout; 