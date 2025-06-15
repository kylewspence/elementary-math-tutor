import React from 'react';
import type { MultiplicationProblem, MultiplicationUserAnswer } from '../../types/multiplication';
import MultiplicationDisplay from './MultiplicationDisplay';

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
}

// This is now just a pass-through component for backward compatibility
// All functionality has been moved to MultiplicationDisplay
const MultiplicationLayout: React.FC<MultiplicationLayoutProps> = (props) => {
    // Create a dummy currentFocus and onFieldClick since MultiplicationDisplay requires them
    const dummyCurrentFocus = {
        fieldType: 'product' as const,
        fieldPosition: 0,
        partialIndex: undefined
    };

    const dummyOnFieldClick = () => { };
    const dummyOnKeyDown = () => { };

    return (
        <MultiplicationDisplay
            problem={props.problem}
            userAnswers={props.userAnswers}
            currentFocus={dummyCurrentFocus}
            onFieldClick={dummyOnFieldClick}
            onKeyDown={dummyOnKeyDown}
            isSubmitted={props.isSubmitted}
            isComplete={props.isComplete}
            onAnswerSubmit={props.onSubmitAnswer}
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