import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import LevelSelectorDrawer from './components/LevelSelector/LevelSelectorDrawer';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import AdditionDisplay from './components/AdditionProblem/AdditionDisplay';
import MultiplicationDisplay from './components/MultiplicationProblem/MultiplicationDisplay';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useAdditionGameState } from './hooks/useAdditionGameState';
import { useAdditionKeyboardNav } from './hooks/useAdditionKeyboardNav';
import { useMultiplicationGameState } from './hooks/useMultiplicationGameState';
import { useMultiplicationKeyboardNav } from './hooks/useMultiplicationKeyboardNav';
import type { UserAnswer, DivisionProblem } from './types/game';
import type { AdditionUserAnswer, AdditionProblem } from './types/addition';
import type { MultiplicationUserAnswer, MultiplicationProblem } from './types/multiplication';

type GameMode = 'division' | 'addition' | 'multiplication';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('division');

  // Division game state
  const {
    gameState,
    generateNewProblem,
    submitAnswer,
    submitProblem,
    clearAnswer,
    nextProblem,
    jumpToLevel,
    resetProblem,
    initializeGame,
    updateProblem,
    enableEditing,
    disableEditing,
    isLoading,
    fetchError,
    loadProblemsForLevel,
  } = useGameState();

  // Division handlers
  const handleAnswerSubmit = (answer: UserAnswer) => {
    submitAnswer(answer);
  };

  const handleAnswerClear = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => {
    clearAnswer(stepNumber, fieldType, position);
  };

  const handleProblemSubmit = () => {
    submitProblem();

    // Clear focus by setting it to a non-existent field after submission
    if (gameState.problem) {
      // Use a step number that's guaranteed not to exist
      jumpToField(-1, 'quotient', 0);
    }
  };

  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
    getPreviousField,
    areAllFieldsFilled: areAllDivisionFieldsFilled,
  } = useKeyboardNav(
    gameState.problem as DivisionProblem | null,
    gameState.userAnswers,
    gameState.isSubmitted
  );

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    handleKeyDown(e, handleProblemSubmit);
  };

  const handleFieldClick = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
    jumpToField(stepNumber, fieldType, position);
  };

  const handleNextProblem = () => {
    nextProblem();
  };

  const handleLevelSelect = (levelId: number) => {
    jumpToLevel(levelId);
  };

  const handleRetryFetch = () => {
    loadProblemsForLevel(gameState.currentLevel);
  };

  // Addition game state
  const {
    gameState: additionGameState,
    generateNewProblem: generateNewAdditionProblem,
    submitAnswer: submitAdditionAnswer,
    submitProblem: submitAdditionProblem,
    clearAnswer: clearAdditionAnswer, // Uncommented
    nextProblem: nextAdditionProblem,
    jumpToLevel: jumpToAdditionLevel,
    resetProblem: resetAdditionProblem,
    initializeGame: initializeAdditionGame,
    updateProblem: updateAdditionProblem,
    enableEditing: enableAdditionEditing,
    disableEditing: disableAdditionEditing,
    isLoading: isAdditionLoading,
    fetchError: additionFetchError,
    loadProblemsForLevel: loadAdditionProblemsForLevel,
  } = useAdditionGameState();

  const {
    currentFocus: additionCurrentFocus,
    handleKeyDown: handleAdditionKeyDown,
    jumpToField: jumpToAdditionField,
    areAllFieldsFilled: areAllAdditionFieldsFilled,
  } = useAdditionKeyboardNav(additionGameState.problem, additionGameState.userAnswers, additionGameState.isSubmitted);

  // Multiplication game state
  const {
    gameState: multiplicationGameState,
    submitAnswer: submitMultiplicationAnswer,
    submitProblem: submitMultiplicationProblem,
    clearAnswer: clearMultiplicationAnswer,
    nextProblem: nextMultiplicationProblem,
    jumpToLevel: jumpToMultiplicationLevel,
    resetProblem: resetMultiplicationProblem,
    initializeGame: initializeMultiplicationGame,
    updateProblem: updateMultiplicationProblem,
    enableEditing: enableMultiplicationEditing,
    disableEditing: disableMultiplicationEditing,
    generateNewProblem: generateNewMultiplicationProblem,
    isLoading: isMultiplicationLoading,
    fetchError: multiplicationFetchError,
    loadProblemsForLevel: loadMultiplicationProblemsForLevel,
  } = useMultiplicationGameState();

  // Multiplication keyboard navigation
  const {
    currentFocus: multiplicationCurrentFocus,
    handleKeyDown: handleMultiplicationKeyDown,
    jumpToField: jumpToMultiplicationField,
    moveToNextField: moveToNextMultiplicationField,
    areAllFieldsFilled: areAllMultiplicationFieldsFilled,
  } = useMultiplicationKeyboardNav(multiplicationGameState.problem, multiplicationGameState.userAnswers, multiplicationGameState.isSubmitted);

  // Initialize the appropriate game on mount and when mode changes
  useEffect(() => {
    if (gameMode === 'division') {
      initializeGame();
    } else if (gameMode === 'addition') {
      initializeAdditionGame();
    } else if (gameMode === 'multiplication') {
      initializeMultiplicationGame();
    }
  }, [gameMode, initializeGame, initializeAdditionGame, initializeMultiplicationGame]);

  // Generate new problem when needed for division
  useEffect(() => {
    if (gameMode === 'division' && !gameState.problem) {
      generateNewProblem();
    }
  }, [gameMode, gameState.problem, generateNewProblem]);

  // Generate new problem when needed for addition
  useEffect(() => {
    if (gameMode === 'addition' && !additionGameState.problem) {
      generateNewAdditionProblem();
    }
  }, [gameMode, additionGameState.problem, generateNewAdditionProblem]);

  // Generate new problem when needed for multiplication
  useEffect(() => {
    if (gameMode === 'multiplication' && !multiplicationGameState.problem) {
      generateNewMultiplicationProblem();
    }
  }, [gameMode, multiplicationGameState.problem, generateNewMultiplicationProblem]);

  // Always set initial focus to the first input field when a new division problem is generated
  useEffect(() => {
    if (gameMode === 'division' && gameState.problem && gameState.userAnswers.length === 0) {
      // Reset focus to the first quotient input
      jumpToField(0, 'quotient', 0);
    }
  }, [gameMode, gameState.problem, gameState.userAnswers.length, jumpToField]);

  // Always set initial focus to the first input field when a new addition problem is generated
  useEffect(() => {
    if (gameMode === 'addition' && additionGameState.problem && additionGameState.userAnswers.length === 0) {
      // Reset focus to the rightmost sum input (ones place) - column 0 is the rightmost
      jumpToAdditionField(0, 'sum');
    }
  }, [gameMode, additionGameState.problem, additionGameState.userAnswers.length, jumpToAdditionField]);

  // Always set initial focus to the first input field when a new multiplication problem is generated
  useEffect(() => {
    if (gameMode === 'multiplication' && multiplicationGameState.problem && multiplicationGameState.userAnswers.length === 0) {
      // Reset focus to the rightmost product digit (position 0)
      jumpToMultiplicationField('product', 0, undefined);
    }
  }, [gameMode, multiplicationGameState.problem, multiplicationGameState.userAnswers.length, jumpToMultiplicationField]);

  // Addition handlers
  const handleAdditionAnswerSubmit = (answer: AdditionUserAnswer) => {
    submitAdditionAnswer(answer);
  };

  const handleAdditionAnswerClear = (columnPosition: number, fieldType: 'sum' | 'carry') => {
    clearAdditionAnswer(columnPosition, fieldType);
  };

  const handleAdditionProblemSubmit = () => {
    submitAdditionProblem();

    // Clear focus by setting it to a non-existent field after submission
    if (additionGameState.problem) {
      // Use a field position that's guaranteed not to exist
      jumpToAdditionField(-1, 'sum');
    }
  };

  const handleAdditionKeyboardNav = (e: React.KeyboardEvent) => {
    handleAdditionKeyDown(e, handleAdditionProblemSubmit);
  };

  const handleAdditionFieldClick = (columnPosition: number, fieldType: 'sum' | 'carry') => {
    jumpToAdditionField(columnPosition, fieldType);
  };

  const handleNextAdditionProblem = () => {
    nextAdditionProblem();
  };

  const handleAdditionLevelSelect = (levelId: number) => {
    jumpToAdditionLevel(levelId);
  };

  const handleRetryAdditionFetch = () => {
    loadAdditionProblemsForLevel(additionGameState.currentLevel);
  };

  // Multiplication handlers
  const handleMultiplicationAnswerSubmit = (value: number, fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
    submitMultiplicationAnswer(value, fieldType, position, partialIndex);
  };

  const handleMultiplicationAnswerClear = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
    clearMultiplicationAnswer(fieldType, position, partialIndex);
  };

  const handleMultiplicationProblemSubmit = () => {
    submitMultiplicationProblem();

    // Clear focus by setting it to a non-existent field after submission
    if (multiplicationGameState.problem) {
      jumpToMultiplicationField('product', -1, undefined);
    }
  };

  const handleMultiplicationKeyboardNav = (e: React.KeyboardEvent) => {
    handleMultiplicationKeyDown(e, handleMultiplicationProblemSubmit);
  };

  const handleMultiplicationFieldClick = (fieldType: 'product' | 'partial' | 'carry', position: number, partialIndex?: number) => {
    jumpToMultiplicationField(fieldType, position, partialIndex);
  };

  const handleNextMultiplicationProblem = () => {
    nextMultiplicationProblem();
  };

  const handleMultiplicationUpdateProblem = (multiplicand: number, multiplier: number) => {
    updateMultiplicationProblem(multiplicand, multiplier);
  };

  const handleRetryMultiplicationFetch = () => {
    loadMultiplicationProblemsForLevel(multiplicationGameState.currentLevel);
  };

  const handleMultiplicationLevelSelect = (levelId: number) => {
    jumpToMultiplicationLevel(levelId);
  };

  const toggleGameMode = (mode: GameMode) => {
    setGameMode(mode);
  };

  const getCurrentLevelInfo = () => {
    if (gameMode === 'division') {
      return {
        currentLevel: gameState.currentLevel,
        availableLevels: gameState.availableLevels,
        completedLevels: gameState.completedLevels,
      };
    } else if (gameMode === 'addition') {
      return {
        currentLevel: additionGameState.currentLevel,
        availableLevels: additionGameState.availableLevels,
        completedLevels: additionGameState.completedLevels,
      };
    } else if (gameMode === 'multiplication') {
      return {
        currentLevel: multiplicationGameState.currentLevel,
        availableLevels: multiplicationGameState.availableLevels,
        completedLevels: multiplicationGameState.completedLevels,
      };
    }
    // Default values if no game mode is active
    return {
      currentLevel: 1,
      availableLevels: [1],
      completedLevels: [],
    };
  };

  const getCurrentProblemInfo = () => {
    if (gameMode === 'division') {
      return {
        currentProblem: gameState.currentProblemIndex + 1,
        totalProblems: gameState.levelProblems.length,
      };
    } else if (gameMode === 'addition') {
      return {
        currentProblem: additionGameState.currentProblemIndex + 1,
        totalProblems: additionGameState.levelProblems.length,
      };
    } else if (gameMode === 'multiplication') {
      return {
        currentProblem: multiplicationGameState.currentProblemIndex + 1,
        totalProblems: multiplicationGameState.levelProblems.length,
      };
    }
    // Default values if no game mode is active
    return {
      currentProblem: 1,
      totalProblems: 1,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        gameMode={gameMode}
        onToggleGameMode={toggleGameMode}
        currentLevel={getCurrentLevelInfo().currentLevel}
        currentProblem={getCurrentProblemInfo().currentProblem}
        totalProblems={getCurrentProblemInfo().totalProblems}
      />

      <main className="container mx-auto px-4 py-8">
        {gameMode === 'division' && (
          <DivisionDisplay
            problem={gameState.problem as DivisionProblem | null}
            userAnswers={gameState.userAnswers}
            currentFocus={currentFocus}
            isSubmitted={gameState.isSubmitted}
            isComplete={gameState.isComplete}
            isLoading={isLoading}
            fetchError={typeof fetchError === 'string' ? new Error(fetchError) : fetchError}
            onAnswerSubmit={handleAnswerSubmit}
            onAnswerClear={handleAnswerClear}
            onProblemSubmit={handleProblemSubmit}
            onNextProblem={handleNextProblem}
            onFieldClick={handleFieldClick}
            onKeyDown={handleKeyboardNav}
            onRetryFetch={handleRetryFetch}
            onResetProblem={resetProblem}
            onEnableEditing={enableEditing}
            onDisableEditing={disableEditing}
            onUpdateProblem={updateProblem}
            onNewProblem={generateNewProblem}
            getPreviousField={getPreviousField}
            areAllFieldsFilled={areAllDivisionFieldsFilled}
          />
        )}

        {gameMode === 'addition' && (
          <AdditionDisplay
            problem={additionGameState.problem as AdditionProblem}
            userAnswers={additionGameState.userAnswers}
            currentFocus={additionCurrentFocus}
            isSubmitted={additionGameState.isSubmitted}
            isComplete={additionGameState.isComplete}
            isLoading={isAdditionLoading}
            fetchError={additionFetchError}
            onAnswerSubmit={handleAdditionAnswerSubmit}
            onAnswerClear={handleAdditionAnswerClear}
            onProblemSubmit={handleAdditionProblemSubmit}
            onNextProblem={handleNextAdditionProblem}
            onFieldClick={handleAdditionFieldClick}
            onKeyDown={handleAdditionKeyboardNav}
            onRetryFetch={handleRetryAdditionFetch}
            onResetProblem={resetAdditionProblem}
            onEnableEditing={enableAdditionEditing}
            onDisableEditing={disableAdditionEditing}
            onUpdateProblem={updateAdditionProblem}
            onNewProblem={generateNewAdditionProblem}
            areAllFieldsFilled={areAllAdditionFieldsFilled}
          />
        )}

        {gameMode === 'multiplication' && (
          <MultiplicationDisplay
            problem={multiplicationGameState.problem as MultiplicationProblem}
            userAnswers={multiplicationGameState.userAnswers}
            currentFocus={multiplicationCurrentFocus}
            isSubmitted={multiplicationGameState.isSubmitted}
            isComplete={multiplicationGameState.isComplete}
            isLoading={isMultiplicationLoading}
            fetchError={typeof multiplicationFetchError === 'string' ? new Error(multiplicationFetchError) : multiplicationFetchError}
            onAnswerSubmit={handleMultiplicationAnswerSubmit}
            onAnswerClear={handleMultiplicationAnswerClear}
            onProblemSubmit={handleMultiplicationProblemSubmit}
            onNextProblem={handleNextMultiplicationProblem}
            onFieldClick={handleMultiplicationFieldClick}
            onKeyDown={handleMultiplicationKeyboardNav}
            onRetryFetch={handleRetryMultiplicationFetch}
            onResetProblem={resetMultiplicationProblem}
            onEnableEditing={enableMultiplicationEditing}
            onDisableEditing={disableMultiplicationEditing}
            onUpdateProblem={handleMultiplicationUpdateProblem}
            onNewProblem={generateNewMultiplicationProblem}
            moveToNextField={moveToNextMultiplicationField}
            areAllFieldsFilled={areAllMultiplicationFieldsFilled}
          />
        )}
      </main>

      <LevelSelectorDrawer
        gameMode={gameMode}
        currentLevel={getCurrentLevelInfo().currentLevel}
        availableLevels={getCurrentLevelInfo().availableLevels}
        completedLevels={getCurrentLevelInfo().completedLevels}
        onLevelSelect={
          gameMode === 'addition' ? handleAdditionLevelSelect :
            gameMode === 'multiplication' ? handleMultiplicationLevelSelect :
              handleLevelSelect
        }
      />
    </div>
  );
}

export default App;