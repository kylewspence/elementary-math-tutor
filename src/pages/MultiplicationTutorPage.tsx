import React, { useEffect } from 'react';
import { useMultiplicationGameState } from '../hooks/useMultiplicationGameState';
import MultiplicationDisplay from '../components/MultiplicationProblem/MultiplicationDisplay';
import { useMultiplicationKeyboardNav } from '../hooks/useMultiplicationKeyboardNav';

const MultiplicationTutorPage: React.FC = () => {
    // Game state management
    const {
        gameState,
        submitAnswer,
        clearAnswer,
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
        submitProblem,
        clearAnswer
    );

    // Ensure focus is set on initial page load
    useEffect(() => {
        if (gameState.problem && setCurrentFocus) {
            // Set focus to the rightmost product digit (position 0)
            setCurrentFocus({
                fieldType: 'product',
                fieldPosition: 0,
                partialIndex: undefined
            });
        }
    }, [gameState.problem, setCurrentFocus]);

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
        // The keyboard navigation hook handles events directly through document listeners
        // This is just a pass-through function to match the interface
    };

    // Handle retry fetch
    const handleRetryFetch = () => {
        loadProblemsForLevel(gameState.currentLevel);
    };

    // Handle problem update
    const handleUpdateProblem = (multiplicand: number, multiplier: number) => {
        updateProblem(multiplicand, multiplier);
    };

    // Handle answer clear
    const handleAnswerClear = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
        clearAnswer(fieldType, position, partialIndex);
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
            onAnswerClear={handleAnswerClear}
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
            setCurrentFocus={setCurrentFocus}
        />
    );
};

export default MultiplicationTutorPage; 