import React, { useEffect } from 'react';
import Header from './components/Header/Header';
import LevelSelector from './components/LevelSelector/LevelSelector';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import RescueMode from './components/RescueMode/RescueMode';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';

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
    switchGameMode,
  } = useGameState();

  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
    isFieldFocused,
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

  // Handle answer submission (no immediate validation)
  const handleAnswerSubmit = (answer: any) => {
    submitAnswer(answer);
  };

  // Handle problem submission for validation
  const handleProblemSubmit = () => {
    submitProblem();
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

  // Handle game mode toggle
  const handleGameModeToggle = () => {
    const newMode = gameState.gameMode === 'practice' ? 'rescue' : 'practice';
    switchGameMode(newMode);
  };

  // Handle rescue mission complete
  const handleRescueComplete = () => {
    // Could add celebration or reset logic here
    console.log('Rescue mission completed!');
  };

  // Show completion message - but not in rescue mode
  if (gameState.isComplete && gameState.problem && gameState.gameMode !== 'rescue') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Problem Complete!
              </h2>
              <p className="text-green-700 mb-6">
                Great job! You solved {gameState.problem.dividend} ÷ {gameState.problem.divisor} = {gameState.problem.quotient}
                {gameState.problem.remainder > 0 && ` remainder ${gameState.problem.remainder}`}
              </p>
              <button
                onClick={handleNextProblem}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Next Problem →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        gameMode={gameState.gameMode}
        onGameModeToggle={handleGameModeToggle}
      />

      <main className="container mx-auto px-4 py-8">
        <div className={`grid gap-8 max-w-7xl mx-auto ${gameState.gameMode === 'rescue'
          ? 'grid-cols-1 lg:grid-cols-5'
          : 'grid-cols-1 lg:grid-cols-4'
          }`}>

          {/* Level Selector Sidebar */}
          <div className="lg:col-span-1">
            <LevelSelector
              gameState={gameState}
              onLevelSelect={handleLevelSelect}
            />
          </div>

          {/* Division Problem Area - Center */}
          <div className={gameState.gameMode === 'rescue' ? 'lg:col-span-3' : 'lg:col-span-3'}>
            {gameState.problem ? (
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
                onKeyDown={handleKeyDown}
                onFieldClick={handleFieldClick}
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

          {/* Rescue Mode Sidebar - Right */}
          {gameState.gameMode === 'rescue' && (
            <div className="lg:col-span-1">
              <RescueMode
                gameState={gameState}
                onComplete={handleRescueComplete}
              />
            </div>
          )}
        </div>

        {/* Problem controls */}
        {gameState.problem && (
          <div className="max-w-7xl mx-auto mt-6 text-center">
            <div className="space-x-4">
              <button
                onClick={() => resetProblem()}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 Reset Problem
              </button>
              <button
                onClick={() => generateNewProblem()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🎲 New Problem
              </button>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;