import { useEffect } from 'react';
import Header from './components/Header/Header';
import LevelSelector from './components/LevelSelector/LevelSelector';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import type { UserAnswer } from './types/game';

function App() {
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

  // Initialize the game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Generate new problem when needed
  useEffect(() => {
    if (!gameState.problem) {
      generateNewProblem();
    }
  }, [gameState.problem, generateNewProblem]);

  // Always set initial focus to the first quotient box when a new problem is generated
  useEffect(() => {
    if (gameState.problem && gameState.userAnswers.length === 0) {
      // Reset focus to the first quotient input
      jumpToField(0, 'quotient', 0);
    }
  }, [gameState.problem, gameState.userAnswers.length, jumpToField]);

  // Handle answer submission (no immediate validation)
  const handleAnswerSubmit = (answer: UserAnswer) => {
    submitAnswer(answer);
  };

  // Handle problem submission for validation
  const handleProblemSubmit = () => {
    submitProblem();

    // Clear focus by setting it to a non-existent field after submission
    // This ensures no field has the blue outline, letting validation colors show
    if (gameState.problem) {
      // Use a field position that's guaranteed not to exist
      jumpToField(-1, 'quotient', -1);
    }
  };

  // Wrapper for the onKeyDown handler to pass the specific handlers needed
  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    handleKeyDown(e, handleProblemSubmit, handleNextProblem);
  };

  // Handle field clicks
  const handleFieldClick = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
    jumpToField(stepNumber, fieldType, position);
  };

  // Handle problem completion
  const handleNextProblem = () => {
    nextProblem();
  };

  // Handle level selection
  const handleLevelSelect = (levelId: number) => {
    jumpToLevel(levelId);
  };

  // Retry loading problems if there was an error
  const handleRetryFetch = () => {
    loadProblemsForLevel(gameState.currentLevel);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

          {/* Level Selector Sidebar */}
          <div className="lg:col-span-1">
            <LevelSelector
              gameState={gameState}
              onLevelSelect={handleLevelSelect}
            />
          </div>

          {/* Division Problem Area */}
          <div className="lg:col-span-3">
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
                  <p>Loading problems from server...</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;