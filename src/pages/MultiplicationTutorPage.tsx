import React from 'react';
import { useMultiplicationGameState } from '../hooks/useMultiplicationGameState';
import MultiplicationDisplay from '../components/MultiplicationProblem/MultiplicationDisplay';
import { useMultiplicationKeyboardNav } from '../hooks/useMultiplicationKeyboardNav';

const MultiplicationTutorPage: React.FC = () => {
    // Game state management
    const {
        gameState,
        submitAnswer,
        submitProblem,
        nextProblem,
        resetProblem,
        generateNewProblem,
        enableEditing,
        disableEditing,
        updateProblem,
        isLoading,
        fetchError,
        loadProblemsForLevel
    } = useMultiplicationGameState();

    // Keyboard navigation
    const {
        currentFocus,
        setCurrentFocus
    } = useMultiplicationKeyboardNav(
        gameState.problem,
        gameState.userAnswers,
        submitAnswer,
        submitProblem
    );

    // Handle field click
    const handleFieldClick = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        setCurrentFocus({
            fieldType,
            fieldPosition: position,
            partialIndex,
        });
    };

    // Handle keyboard navigation
    const handleKeyDown = () => {
        // Let the keyboard navigation hook handle it
        // This is just a pass-through function to match the division interface
    };

    // Handle retry fetch
    const handleRetryFetch = () => {
        loadProblemsForLevel(gameState.currentLevel);
    };

    // Handle problem update
    const handleUpdateProblem = (multiplicand: number, multiplier: number) => {
        updateProblem(multiplicand, multiplier);
    };

    return (
        <MultiplicationDisplay
            problem={gameState.problem}
            userAnswers={gameState.userAnswers}
            currentFocus={currentFocus}
            isSubmitted={gameState.isSubmitted}
            isComplete={gameState.isComplete}
            isLoading={isLoading}
            fetchError={fetchError ? new Error(fetchError) : null}
            onAnswerSubmit={submitAnswer}
            onProblemSubmit={submitProblem}
            onNextProblem={nextProblem}
            onFieldClick={handleFieldClick}
            onKeyDown={handleKeyDown}
            onRetryFetch={handleRetryFetch}
            onResetProblem={resetProblem}
            onNewProblem={generateNewProblem}
            onEnableEditing={enableEditing}
            onDisableEditing={disableEditing}
            onUpdateProblem={handleUpdateProblem}
        />
    );
};

export default MultiplicationTutorPage; 