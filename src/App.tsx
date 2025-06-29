import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import Header from './components/Header/Header';
import LevelSelectorDrawer from './components/LevelSelector/LevelSelectorDrawer';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import AdditionDisplay from './components/AdditionProblem/AdditionDisplay';
import MultiplicationDisplay from './components/MultiplicationProblem/MultiplicationDisplay';
import SubtractionDisplay from './components/SubtractionProblem/SubtractionDisplay';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useAdditionGameState } from './hooks/useAdditionGameState';
import { useAdditionKeyboardNav } from './hooks/useAdditionKeyboardNav';
import { useMultiplicationGameState } from './hooks/useMultiplicationGameState';
import { useMultiplicationKeyboardNav } from './hooks/useMultiplicationKeyboardNav';
import { useSubtractionGameState } from './hooks/useSubtractionGameState';
import { useSubtractionKeyboardNav } from './hooks/useSubtractionKeyboardNav';
import type { DivisionProblem } from './types/game';
import type { AdditionProblem } from './types/addition';
import type { MultiplicationProblem } from './types/multiplication';
import type { SubtractionProblem } from './types/subtraction';
import { useSessionPersistence } from './hooks/useSessionPersistence';
import type { GameMode } from './types/game';

import './utils/apiCallLogger'; // Initialize the logger

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('division');
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false);

  // Session persistence
  const { saveProgress, loadProgress } = useSessionPersistence();

  // Division game state
  const {
    gameState,
    generateNewProblem,
    submitAnswer,
    submitProblem,
    clearAnswer,
    nextProblem,
    jumpToLevel,
    restoreGameState,
    initializeGame,
    updateProblem,
    enableEditing,
    disableEditing,
    isLoading,
    fetchError,
    loadProblemsForLevel,
  } = useGameState();

  // Addition game state 
  const {
    gameState: additionGameState,
    generateNewProblem: generateNewAdditionProblem,
    submitAnswer: submitAdditionAnswer,
    submitProblem: submitAdditionProblem,
    clearAnswer: clearAdditionAnswer,
    nextProblem: nextAdditionProblem,
    jumpToLevel: jumpToAdditionLevel,
    restoreGameState: restoreAdditionGameState,
    initializeGame: initializeAdditionGame,
    updateProblem: updateAdditionProblem,
    enableEditing: enableAdditionEditing,
    disableEditing: disableAdditionEditing,
    isLoading: isAdditionLoading,
    fetchError: additionFetchError,
    loadProblemsForLevel: loadAdditionProblemsForLevel,
  } = useAdditionGameState();

  // Multiplication game state
  const {
    gameState: multiplicationGameState,
    generateNewProblem: generateNewMultiplicationProblem,
    submitAnswer: submitMultiplicationAnswer,
    submitProblem: submitMultiplicationProblem,
    clearAnswer: clearMultiplicationAnswer,
    nextProblem: nextMultiplicationProblem,
    jumpToLevel: jumpToMultiplicationLevel,
    restoreGameState: restoreMultiplicationGameState,
    initializeGame: initializeMultiplicationGame,
    updateProblem: updateMultiplicationProblem,
    enableEditing: enableMultiplicationEditing,
    disableEditing: disableMultiplicationEditing,
    isLoading: isMultiplicationLoading,
    fetchError: multiplicationFetchError,
    loadProblemsForLevel: loadMultiplicationProblemsForLevel,
  } = useMultiplicationGameState();

  // Subtraction game state
  const {
    gameState: subtractionGameState,
    generateNewProblem: generateNewSubtractionProblem,
    submitAnswer: submitSubtractionAnswer,
    submitProblem: submitSubtractionProblem,
    clearAnswer: clearSubtractionAnswer,
    nextProblem: nextSubtractionProblem,
    jumpToLevel: jumpToSubtractionLevel,
    restoreGameState: restoreSubtractionGameState,
    initializeGame: initializeSubtractionGame,
    updateProblem: updateSubtractionProblem,
    enableEditing: enableSubtractionEditing,
    disableEditing: disableSubtractionEditing,
    isLoading: isSubtractionLoading,
    fetchError: subtractionFetchError,
    loadProblemsForLevel: loadSubtractionProblemsForLevel,
  } = useSubtractionGameState();

  // Keyboard navigation hooks
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

  const {
    currentFocus: additionCurrentFocus,
    handleKeyDown: handleAdditionKeyDown,
    jumpToField: jumpToAdditionField,
    areAllFieldsFilled: areAllAdditionFieldsFilled,
  } = useAdditionKeyboardNav(additionGameState.problem, additionGameState.userAnswers, additionGameState.isSubmitted);

  const {
    currentFocus: multiplicationCurrentFocus,
    handleKeyDown: handleMultiplicationKeyDown,
    jumpToField: jumpToMultiplicationField,
    moveToNextField: moveToNextMultiplicationField,
    areAllFieldsFilled: areAllMultiplicationFieldsFilled,
  } = useMultiplicationKeyboardNav(multiplicationGameState.problem, multiplicationGameState.userAnswers, multiplicationGameState.isSubmitted);

  const {
    currentFocus: subtractionCurrentFocus,
    handleKeyDown: handleSubtractionKeyDown,
    jumpToField: jumpToSubtractionField,
    areAllFieldsFilled: areAllSubtractionFieldsFilled,
  } = useSubtractionKeyboardNav(subtractionGameState.problem, subtractionGameState.userAnswers, subtractionGameState.isSubmitted);

  // Load saved state on startup (only once)
  useEffect(() => {
    if (hasLoadedSavedState) return; // Prevent running multiple times

    const saved = loadProgress();
    setHasLoadedSavedState(true);

    if (saved) {
      setGameMode(saved.gameMode);

      // Restore division state if it exists using exact state restoration
      if (saved.divisionState && saved.divisionState.currentLevel > 0 && saved.divisionState.levelProblems) {
        restoreGameState(
          saved.divisionState.currentLevel,
          saved.divisionState.currentProblemIndex,
          saved.divisionState.levelProblems
        );
      }

      // Restore addition state if it exists using exact state restoration
      if (saved.additionState && saved.additionState.currentLevel > 0 && saved.additionState.levelProblems) {
        restoreAdditionGameState(
          saved.additionState.currentLevel,
          saved.additionState.currentProblemIndex,
          saved.additionState.levelProblems
        );
      }

      // Restore multiplication state if it exists using exact state restoration
      if (saved.multiplicationState && saved.multiplicationState.currentLevel > 0 && saved.multiplicationState.levelProblems) {
        restoreMultiplicationGameState(
          saved.multiplicationState.currentLevel,
          saved.multiplicationState.currentProblemIndex,
          saved.multiplicationState.levelProblems
        );
      }

      // Restore subtraction state if it exists using exact state restoration
      if (saved.subtractionState && saved.subtractionState.currentLevel > 0 && saved.subtractionState.levelProblems) {
        restoreSubtractionGameState(
          saved.subtractionState.currentLevel,
          saved.subtractionState.currentProblemIndex,
          saved.subtractionState.levelProblems
        );
      }

      // Only initialize modes that don't have valid saved state
      if (!saved.divisionState || !saved.divisionState.levelProblems) {
        if (gameMode === 'division') {
          console.log(`🎮 Initializing game mode: ${gameMode} (saved state incomplete)`);
          initializeGame();
        }
      }

      if (!saved.additionState || !saved.additionState.levelProblems) {
        if (gameMode === 'addition') {
          console.log(`🎮 Initializing game mode: ${gameMode} (saved state incomplete)`);
          initializeAdditionGame();
        }
      }

      if (!saved.multiplicationState || !saved.multiplicationState.levelProblems) {
        if (gameMode === 'multiplication') {
          console.log(`🎮 Initializing game mode: ${gameMode} (saved state incomplete)`);
          initializeMultiplicationGame();
        }
      }

      if (!saved.subtractionState || !saved.subtractionState.levelProblems) {
        if (gameMode === 'subtraction') {
          console.log(`🎮 Initializing game mode: ${gameMode} (saved state incomplete)`);
          initializeSubtractionGame();
        }
      }
    } else {
      // Only initialize the current game mode if we don't have saved state
      console.log(`🎮 Initializing game mode: ${gameMode} (no saved state)`);
      if (gameMode === 'division') {
        initializeGame();
      } else if (gameMode === 'addition') {
        initializeAdditionGame();
      } else if (gameMode === 'multiplication') {
        initializeMultiplicationGame();
      } else if (gameMode === 'subtraction') {
        initializeSubtractionGame();
      }
    }
  }, [loadProgress, hasLoadedSavedState, restoreGameState, restoreAdditionGameState, restoreMultiplicationGameState, restoreSubtractionGameState, gameMode, initializeGame, initializeAdditionGame, initializeMultiplicationGame, initializeSubtractionGame]);

  // Save current state when auto-save is triggered
  useEffect(() => {
    const handleAutoSave = () => {
      const currentProgress = {
        gameMode,
        divisionState: {
          currentLevel: gameState.currentLevel,
          currentProblemIndex: gameState.currentProblemIndex,
          levelProblems: gameState.levelProblems,
        },
        additionState: {
          currentLevel: additionGameState.currentLevel,
          currentProblemIndex: additionGameState.currentProblemIndex,
          levelProblems: additionGameState.levelProblems,
        },
        multiplicationState: {
          currentLevel: multiplicationGameState.currentLevel,
          currentProblemIndex: multiplicationGameState.currentProblemIndex,
          levelProblems: multiplicationGameState.levelProblems,
        },
        subtractionState: {
          currentLevel: subtractionGameState.currentLevel,
          currentProblemIndex: subtractionGameState.currentProblemIndex,
          levelProblems: subtractionGameState.levelProblems,
        },
      };
      // Auto-save triggered - saving progress
      saveProgress(currentProgress);
    };

    window.addEventListener('autoSaveProgress', handleAutoSave);
    return () => window.removeEventListener('autoSaveProgress', handleAutoSave);
  }, [saveProgress, gameMode, gameState.currentLevel, gameState.currentProblemIndex, gameState.levelProblems,
    additionGameState.currentLevel, additionGameState.currentProblemIndex, additionGameState.levelProblems,
    multiplicationGameState.currentLevel, multiplicationGameState.currentProblemIndex, multiplicationGameState.levelProblems,
    subtractionGameState.currentLevel, subtractionGameState.currentProblemIndex, subtractionGameState.levelProblems]);

  // Handle auto-restore when tab becomes visible again
  useEffect(() => {
    const handleAutoRestore = () => {
      const saved = loadProgress();

      if (saved) {
        // Restore the appropriate game mode state based on current mode
        if (gameMode === 'division' && saved.divisionState && saved.divisionState.levelProblems) {
          restoreGameState(
            saved.divisionState.currentLevel,
            saved.divisionState.currentProblemIndex,
            saved.divisionState.levelProblems
          );
        } else if (gameMode === 'addition' && saved.additionState && saved.additionState.levelProblems) {
          restoreAdditionGameState(
            saved.additionState.currentLevel,
            saved.additionState.currentProblemIndex,
            saved.additionState.levelProblems
          );
        } else if (gameMode === 'multiplication' && saved.multiplicationState && saved.multiplicationState.levelProblems) {
          restoreMultiplicationGameState(
            saved.multiplicationState.currentLevel,
            saved.multiplicationState.currentProblemIndex,
            saved.multiplicationState.levelProblems
          );
        } else if (gameMode === 'subtraction' && saved.subtractionState && saved.subtractionState.levelProblems) {
          restoreSubtractionGameState(
            saved.subtractionState.currentLevel,
            saved.subtractionState.currentProblemIndex,
            saved.subtractionState.levelProblems
          );
        }
      }
    };

    window.addEventListener('autoRestoreProgress', handleAutoRestore);
    return () => window.removeEventListener('autoRestoreProgress', handleAutoRestore);
  }, [loadProgress, gameMode, restoreGameState, restoreAdditionGameState, restoreMultiplicationGameState, restoreSubtractionGameState]);

  // Handle tab switches - initialize new game modes when first accessed
  useEffect(() => {
    // Only run after initial load has completed
    if (!hasLoadedSavedState) return;

    // Check if the current game mode already has problems loaded (either from current session or saved state)
    if (gameMode === 'division' && gameState.levelProblems.length > 0) return;
    if (gameMode === 'addition' && additionGameState.levelProblems.length > 0) return;
    if (gameMode === 'multiplication' && multiplicationGameState.levelProblems.length > 0) return;
    if (gameMode === 'subtraction' && subtractionGameState.levelProblems.length > 0) return;

    // Initialize the new game mode (this only runs on first access to a tab)
    console.log(`🎮 Tab switch - initializing game mode: ${gameMode} (first time)`);
    if (gameMode === 'division') {
      initializeGame();
    } else if (gameMode === 'addition') {
      initializeAdditionGame();
    } else if (gameMode === 'multiplication') {
      initializeMultiplicationGame();
    } else if (gameMode === 'subtraction') {
      initializeSubtractionGame();
    }
  }, [gameMode, hasLoadedSavedState, gameState.levelProblems.length, additionGameState.levelProblems.length, multiplicationGameState.levelProblems.length, subtractionGameState.levelProblems.length, initializeGame, initializeAdditionGame, initializeMultiplicationGame, initializeSubtractionGame]);

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

  // Generate new problem when needed for subtraction
  useEffect(() => {
    if (gameMode === 'subtraction' && !subtractionGameState.problem) {
      generateNewSubtractionProblem();
    }
  }, [gameMode, subtractionGameState.problem, generateNewSubtractionProblem]);

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

  // Always set initial focus to the first input field when a new subtraction problem is generated
  useEffect(() => {
    if (gameMode === 'subtraction' && subtractionGameState.problem && subtractionGameState.userAnswers.length === 0) {
      // Reset focus to the rightmost difference input (ones place) - column 0 is the rightmost
      jumpToSubtractionField(0, 'difference');
    }
  }, [gameMode, subtractionGameState.problem, subtractionGameState.userAnswers.length, jumpToSubtractionField]);

  // Division handlers - reordered to fix dependencies
  const handleDivisionNext = useCallback(() => {
    nextProblem();
    // Immediately set focus to first field to keep keyboard open
    setTimeout(() => {
      jumpToField(0, 'quotient', 0);
    }, 50);
  }, [nextProblem, jumpToField]);

  const handleDivisionSubmit = useCallback(() => {
    if (gameState.isComplete) {
      handleDivisionNext();
    } else {
      submitProblem();
      // Remove focus clearing - keep keyboard open
    }
  }, [gameState.isComplete, submitProblem, handleDivisionNext]);

  // Addition handlers - reordered to fix dependencies
  const handleAdditionNext = useCallback(() => {
    nextAdditionProblem();
    // Immediately set focus to first field to keep keyboard open
    setTimeout(() => {
      jumpToAdditionField(0, 'sum');
    }, 50);
  }, [nextAdditionProblem, jumpToAdditionField]);

  const handleAdditionSubmit = useCallback(() => {
    if (additionGameState.isComplete) {
      handleAdditionNext();
    } else {
      submitAdditionProblem();
      // Remove focus clearing - keep keyboard open
    }
  }, [additionGameState.isComplete, submitAdditionProblem, handleAdditionNext]);

  // Multiplication handlers - reordered to fix dependencies
  const handleMultiplicationNext = useCallback(() => {
    nextMultiplicationProblem();
    // Immediately set focus to first field to keep keyboard open
    setTimeout(() => {
      jumpToMultiplicationField('product', 0);
    }, 50);
  }, [nextMultiplicationProblem, jumpToMultiplicationField]);

  const handleMultiplicationSubmit = useCallback(() => {
    if (multiplicationGameState.isComplete) {
      handleMultiplicationNext();
    } else {
      submitMultiplicationProblem();
      // Remove focus clearing - keep keyboard open
    }
  }, [multiplicationGameState.isComplete, submitMultiplicationProblem, handleMultiplicationNext]);

  // Subtraction handlers - reordered to fix dependencies
  const handleSubtractionNext = useCallback(() => {
    nextSubtractionProblem();
    // Immediately set focus to first field to keep keyboard open
    setTimeout(() => {
      jumpToSubtractionField(0, 'difference');
    }, 50);
  }, [nextSubtractionProblem, jumpToSubtractionField]);

  const handleSubtractionSubmit = useCallback(() => {
    if (subtractionGameState.isComplete) {
      handleSubtractionNext();
    } else {
      submitSubtractionProblem();
      // Remove focus clearing - keep keyboard open
    }
  }, [subtractionGameState.isComplete, submitSubtractionProblem, handleSubtractionNext]);

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
    } else if (gameMode === 'subtraction') {
      return {
        currentLevel: subtractionGameState.currentLevel,
        availableLevels: subtractionGameState.availableLevels,
        completedLevels: subtractionGameState.completedLevels,
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
    } else if (gameMode === 'subtraction') {
      return {
        currentProblem: subtractionGameState.currentProblemIndex + 1,
        totalProblems: subtractionGameState.levelProblems.length,
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
            onAnswerSubmit={submitAnswer}
            onAnswerClear={clearAnswer}
            onProblemSubmit={handleDivisionSubmit}
            onNextProblem={handleDivisionNext}
            onFieldClick={jumpToField}
            onKeyDown={handleKeyDown}
            onRetryFetch={() => loadProblemsForLevel(gameState.currentLevel)}

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
            problem={additionGameState.problem as AdditionProblem | null}
            userAnswers={additionGameState.userAnswers}
            currentFocus={additionCurrentFocus}
            isSubmitted={additionGameState.isSubmitted}
            isComplete={additionGameState.isComplete}
            isLoading={isAdditionLoading}
            fetchError={additionFetchError}
            onAnswerSubmit={submitAdditionAnswer}
            onAnswerClear={clearAdditionAnswer}
            onProblemSubmit={handleAdditionSubmit}
            onNextProblem={handleAdditionNext}
            onFieldClick={jumpToAdditionField}
            onKeyDown={handleAdditionKeyDown}
            onRetryFetch={() => loadAdditionProblemsForLevel(additionGameState.currentLevel)}

            onEnableEditing={enableAdditionEditing}
            onDisableEditing={disableAdditionEditing}
            onUpdateProblem={updateAdditionProblem}
            onNewProblem={generateNewAdditionProblem}
            areAllFieldsFilled={areAllAdditionFieldsFilled}
          />
        )}

        {gameMode === 'multiplication' && (
          <MultiplicationDisplay
            problem={multiplicationGameState.problem as MultiplicationProblem | null}
            userAnswers={multiplicationGameState.userAnswers}
            currentFocus={multiplicationCurrentFocus}
            isSubmitted={multiplicationGameState.isSubmitted}
            isComplete={multiplicationGameState.isComplete}
            isLoading={isMultiplicationLoading}
            fetchError={typeof multiplicationFetchError === 'string' ? new Error(multiplicationFetchError) : multiplicationFetchError}
            onAnswerSubmit={submitMultiplicationAnswer}
            onAnswerClear={clearMultiplicationAnswer}
            onProblemSubmit={handleMultiplicationSubmit}
            onNextProblem={handleMultiplicationNext}
            onFieldClick={jumpToMultiplicationField}
            onKeyDown={handleMultiplicationKeyDown}
            onRetryFetch={() => loadMultiplicationProblemsForLevel(multiplicationGameState.currentLevel)}

            onEnableEditing={enableMultiplicationEditing}
            onDisableEditing={disableMultiplicationEditing}
            onUpdateProblem={updateMultiplicationProblem}
            onNewProblem={generateNewMultiplicationProblem}
            moveToNextField={moveToNextMultiplicationField}
            areAllFieldsFilled={areAllMultiplicationFieldsFilled}
          />
        )}

        {gameMode === 'subtraction' && (
          <SubtractionDisplay
            problem={subtractionGameState.problem as SubtractionProblem | null}
            userAnswers={subtractionGameState.userAnswers}
            currentFocus={subtractionCurrentFocus}
            isSubmitted={subtractionGameState.isSubmitted}
            isComplete={subtractionGameState.isComplete}
            isLoading={isSubtractionLoading}
            fetchError={subtractionFetchError}
            onAnswerSubmit={submitSubtractionAnswer}
            onAnswerClear={clearSubtractionAnswer}
            onProblemSubmit={handleSubtractionSubmit}
            onNextProblem={handleSubtractionNext}
            onFieldClick={jumpToSubtractionField}
            onKeyDown={handleSubtractionKeyDown}
            onRetryFetch={() => loadSubtractionProblemsForLevel(subtractionGameState.currentLevel)}

            onEnableEditing={enableSubtractionEditing}
            onDisableEditing={disableSubtractionEditing}
            onUpdateProblem={updateSubtractionProblem}
            onNewProblem={generateNewSubtractionProblem}
            areAllFieldsFilled={areAllSubtractionFieldsFilled}
          />
        )}
      </main>

      <LevelSelectorDrawer
        gameMode={gameMode}
        currentLevel={getCurrentLevelInfo().currentLevel}
        availableLevels={getCurrentLevelInfo().availableLevels}
        completedLevels={getCurrentLevelInfo().completedLevels}
        onLevelSelect={
          gameMode === 'addition' ? jumpToAdditionLevel :
            gameMode === 'multiplication' ? jumpToMultiplicationLevel :
              gameMode === 'subtraction' ? jumpToSubtractionLevel :
                jumpToLevel
        }
      />
    </div>
  );
}

export default App;