import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import LevelSelectorDrawer from './components/LevelSelector/LevelSelectorDrawer';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import AdditionDisplay from './components/AdditionProblem/AdditionDisplay';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useAdditionGameState } from './hooks/useAdditionGameState';
import { useAdditionKeyboardNav } from './hooks/useAdditionKeyboardNav';
import type { UserAnswer } from './types/game';
import type { AdditionUserAnswer } from './types/addition';
import MultiplicationTutorPage from './pages/MultiplicationTutorPage';

type GameMode = 'division' | 'addition' | 'multiplication';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('division');

  // Division game state
  const {
    gameState,
    generateNewProblem,
    submitAnswer,
    submitProblem,
    // clearAnswer, // Unused variable
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

  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
  } = useKeyboardNav(gameState.problem, gameState.userAnswers, gameState.isSubmitted);

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
  } = useAdditionKeyboardNav(additionGameState.problem, additionGameState.userAnswers, additionGameState.isSubmitted);

  // Initialize the appropriate game on mount and when mode changes
  useEffect(() => {
    if (gameMode === 'division') {
      initializeGame();
    } else if (gameMode === 'addition') {
      initializeAdditionGame();
    }
  }, [gameMode, initializeGame, initializeAdditionGame]);

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
      // Only set initial focus if we're not already focused on a valid field
      if (additionCurrentFocus.columnPosition === -1 || additionCurrentFocus.columnPosition === undefined) {
        // Reset focus to the first sum input - use column 0 which should always exist
        jumpToAdditionField(0, 'sum');
      }
    }
  }, [gameMode, additionGameState.problem, additionGameState.userAnswers.length, jumpToAdditionField, additionCurrentFocus]);

  // Division handlers
  const handleAnswerSubmit = (answer: UserAnswer) => {
    submitAnswer(answer);
  };

  const handleProblemSubmit = () => {
    submitProblem();

    // Clear focus by setting it to a non-existent field after submission
    if (gameState.problem) {
      // Use a field position that's guaranteed not to exist
      jumpToField(-1, 'quotient', -1);
    }
  };

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    handleKeyDown(e, handleProblemSubmit, handleNextProblem);
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
    handleAdditionKeyDown(e, handleAdditionProblemSubmit, handleNextAdditionProblem);
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
    }
    // Default values if no game mode is active
    return {
      currentLevel: 1,
      availableLevels: [1],
      completedLevels: [],
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        gameMode={gameMode}
        onToggleGameMode={toggleGameMode}
        currentLevel={getCurrentLevelInfo().currentLevel}
      />

      <main className="container mx-auto px-4 py-8">
        {gameMode === 'division' && (
          <DivisionDisplay
            problem={gameState.problem}
            userAnswers={gameState.userAnswers}
            currentFocus={currentFocus}
            isSubmitted={gameState.isSubmitted}
            isComplete={gameState.isComplete}
            isLoading={isLoading}
            fetchError={fetchError}
            onAnswerSubmit={handleAnswerSubmit}
            onProblemSubmit={handleProblemSubmit}
            onNextProblem={handleNextProblem}
            onFieldClick={handleFieldClick}
            onKeyDown={handleKeyboardNav}
            onRetryFetch={handleRetryFetch}
            onResetProblem={resetProblem}
            onEnableEditing={enableEditing}
            onDisableEditing={disableEditing}
            onUpdateProblem={updateProblem}
          />
        )}

        {gameMode === 'addition' && (
          <AdditionDisplay
            problem={additionGameState.problem}
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
          />
        )}

        {gameMode === 'multiplication' && (
          <MultiplicationTutorPage />
        )}
      </main>

      <LevelSelectorDrawer
        gameMode={gameMode}
        currentLevel={getCurrentLevelInfo().currentLevel}
        availableLevels={getCurrentLevelInfo().availableLevels}
        completedLevels={getCurrentLevelInfo().completedLevels}
        onLevelSelect={gameMode === 'addition' ? handleAdditionLevelSelect : handleLevelSelect}
      />
    </div>
  );
}

export default App;