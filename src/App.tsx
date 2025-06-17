import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import LevelSelectorDrawer from './components/LevelSelector/LevelSelectorDrawer';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import AdditionDisplay from './components/AdditionProblem/AdditionDisplay';
import { useMathGameState } from './hooks/useMathGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useAdditionGameState } from './hooks/useAdditionGameState';
import { useAdditionKeyboardNav } from './hooks/useAdditionKeyboardNav';
import type { UserAnswer, DivisionProblem } from './types/game';
import type { AdditionUserAnswer, AdditionProblem } from './types/addition';
import MultiplicationTutorPage from './pages/MultiplicationTutorPage';
import { generateProblem } from './utils/problemGenerator';
import { validateAnswer, isProblemComplete } from './utils/divisionValidator';
import { GAME_LEVELS } from './utils/constants';

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
    resetProblem,
    jumpToLevel,
    enableEditing,
    disableEditing,
    isLoading,
    fetchError,
  } = useMathGameState<DivisionProblem, UserAnswer>({
    generateProblem: (levelId = 1) => {
      const level = GAME_LEVELS.find(l => l.id === levelId);
      if (!level) throw new Error(`Level ${levelId} not found`);
      return generateProblem(level);
    },
    validateAnswer,
    isProblemComplete,
    initialLevel: 1,
  });

  // Division handlers
  const handleAnswerSubmit = (answer: UserAnswer) => {
    submitAnswer(answer);
  };

  const handleAnswerClear = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number) => {
    clearAnswer((a: UserAnswer) => a.stepNumber === stepNumber && a.fieldType === fieldType && a.fieldPosition === position);
  };

  const handleProblemSubmit = () => {
    submitProblem();
    // Clear focus by setting it to a non-existent field after submission
    if (gameState.problem) {
      // Use a step number that's guaranteed not to exist
      jumpToField({ stepNumber: -1, fieldType: 'quotient', fieldPosition: 0 });
    }
  };

  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
  } = useKeyboardNav(
    gameState.problem as DivisionProblem | null,
    gameState.userAnswers,
    gameState.isSubmitted,
    handleProblemSubmit
  );

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    handleKeyDown(e);
  };

  const handleFieldClick = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
    jumpToField({ stepNumber, fieldType, fieldPosition: position });
  };

  const handleNextProblem = () => {
    nextProblem();
  };

  const handleLevelSelect = (levelId: number) => {
    jumpToLevel(levelId);
  };

  const handleRetryFetch = () => {
    generateNewProblem();
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
  } = useAdditionKeyboardNav(additionGameState.problem, additionGameState.userAnswers, additionGameState.isSubmitted);

  // Always set initial focus to the first input field when a new division problem is generated
  useEffect(() => {
    if (gameMode === 'division' && gameState.problem && gameState.userAnswers.length === 0) {
      // Reset focus to the first quotient input
      jumpToField({ stepNumber: 0, fieldType: 'quotient', fieldPosition: 0 });
    }
  }, [gameMode, gameState.problem, gameState.userAnswers.length, jumpToField]);

  // Always set initial focus to the first input field when a new addition problem is generated
  useEffect(() => {
    if (gameMode === 'addition' && additionGameState.problem && additionGameState.userAnswers.length === 0) {
      // Reset focus to the rightmost sum input (ones place) - column 0 is the rightmost
      jumpToAdditionField({ columnPosition: 0, fieldType: 'sum' });
    }
  }, [gameMode, additionGameState.problem, additionGameState.userAnswers.length, jumpToAdditionField]);

  // Addition handlers
  const handleAdditionAnswerSubmit = (answer: AdditionUserAnswer) => {
    submitAdditionAnswer(answer);
  };

  const handleAdditionAnswerClear = (columnPosition: number, fieldType: 'sum' | 'carry') => {
    clearAdditionAnswer((a: AdditionUserAnswer) => a.columnPosition === columnPosition && a.fieldType === fieldType);
  };

  const handleAdditionProblemSubmit = () => {
    submitAdditionProblem();
    // Clear focus by setting it to a non-existent field after submission
    if (additionGameState.problem) {
      // Use a field position that's guaranteed not to exist
      jumpToAdditionField({ columnPosition: -1, fieldType: 'sum' });
    }
  };

  const handleAdditionKeyboardNav = (e: React.KeyboardEvent) => {
    handleAdditionKeyDown(e);
  };

  const handleAdditionFieldClick = (columnPosition: number, fieldType: 'sum' | 'carry') => {
    jumpToAdditionField({ columnPosition, fieldType });
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
        availableLevels: [1],
        completedLevels: [],
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