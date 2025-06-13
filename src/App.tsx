import { useEffect, useState } from 'react';
import Header from './components/Header/Header';
import LevelSelector from './components/LevelSelector/LevelSelector';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import AdditionDisplay from './components/AdditionProblem/AdditionDisplay';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useAdditionGameState } from './hooks/useAdditionGameState';
import { useAdditionKeyboardNav } from './hooks/useAdditionKeyboardNav';
import type { UserAnswer } from './types/game';
import type { AdditionUserAnswer } from './types/addition';

type GameMode = 'division' | 'addition';

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
    clearAnswer: clearAdditionAnswer,
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
    } else {
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
      // Reset focus to the first sum input
      jumpToAdditionField(0, 'sum');
    }
  }, [gameMode, additionGameState.problem, additionGameState.userAnswers.length, jumpToAdditionField]);

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

  // Toggle between division and addition modes
  const toggleGameMode = () => {
    setGameMode(prev => prev === 'division' ? 'addition' : 'division');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Game Mode Toggle */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <button
              onClick={() => setGameMode('division')}
              className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'division'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Division
            </button>
            <button
              onClick={() => setGameMode('addition')}
              className={`px-4 py-2 rounded-lg transition-colors ${gameMode === 'addition'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Addition
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

          {/* Level Selector Sidebar */}
          <div className="lg:col-span-1">
            {gameMode === 'division' ? (
              <LevelSelector
                gameState={gameState}
                onLevelSelect={handleLevelSelect}
              />
            ) : (
              <LevelSelector
                gameState={additionGameState}
                onLevelSelect={handleAdditionLevelSelect}
              />
            )}
          </div>

          {/* Problem Area */}
          <div className="lg:col-span-3">
            {/* Division Mode */}
            {gameMode === 'division' && (
              <>
                {fetchError && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          {fetchError}
                          <button
                            onClick={handleRetryFetch}
                            className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
                          >
                            Retry
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && !gameState.problem ? (
                  <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-gray-500">
                      <div className="animate-spin text-4xl mb-4">🔄</div>
                      <p>Loading division problems...</p>
                    </div>
                  </div>
                ) : gameState.problem ? (
                  <DivisionDisplay
                    problem={gameState.problem}
                    userAnswers={gameState.userAnswers}
                    currentFocus={currentFocus}
                    onAnswerSubmit={handleAnswerSubmit}
                    onAnswerClear={clearAnswer}
                    onProblemChange={updateProblem}
                    onProblemSubmit={handleProblemSubmit}
                    onEnableEditing={enableEditing}
                    onDisableEditing={disableEditing}
                    isSubmitted={gameState.isSubmitted}
                    onKeyDown={handleKeyboardNav}
                    onFieldClick={handleFieldClick}
                    gameState={gameState}
                    onNextProblem={handleNextProblem}
                    onResetProblem={resetProblem}
                    onNewProblem={generateNewProblem}
                  />
                ) : (
                  <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">🔄</div>
                      <p>Loading problem...</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Addition Mode */}
            {gameMode === 'addition' && (
              <>
                {additionFetchError && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          {additionFetchError}
                          <button
                            onClick={handleRetryAdditionFetch}
                            className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
                          >
                            Retry
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isAdditionLoading && !additionGameState.problem ? (
                  <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-gray-500">
                      <div className="animate-spin text-4xl mb-4">🔄</div>
                      <p>Loading addition problems...</p>
                    </div>
                  </div>
                ) : additionGameState.problem ? (
                  <AdditionDisplay
                    problem={additionGameState.problem}
                    userAnswers={additionGameState.userAnswers}
                    currentFocus={additionCurrentFocus}
                    onAnswerSubmit={handleAdditionAnswerSubmit}
                    onAnswerClear={clearAdditionAnswer}
                    onProblemChange={updateAdditionProblem}
                    onProblemSubmit={handleAdditionProblemSubmit}
                    onEnableEditing={enableAdditionEditing}
                    onDisableEditing={disableAdditionEditing}
                    isSubmitted={additionGameState.isSubmitted}
                    onKeyDown={handleAdditionKeyboardNav}
                    onFieldClick={handleAdditionFieldClick}
                    gameState={additionGameState}
                    onNextProblem={handleNextAdditionProblem}
                    onResetProblem={resetAdditionProblem}
                    onNewProblem={generateNewAdditionProblem}
                  />
                ) : (
                  <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">🔄</div>
                      <p>Loading problem...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;