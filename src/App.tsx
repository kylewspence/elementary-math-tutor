import React, { useEffect } from 'react';
import Header from './components/Header/Header';
import LevelSelector from './components/LevelSelector/LevelSelector';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';

function App() {
  const {
    gameState,
    generateNewProblem,
    submitAnswer,
    clearAnswer,
    nextProblem,
    jumpToLevel,
    resetProblem,
    initializeGame,
  } = useGameState();

  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
    isFieldFocused,
  } = useKeyboardNav(gameState.problem);

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

  // Handle answer submission
  const handleAnswerSubmit = (answer: any) => {
    const isCorrect = submitAnswer(answer);
    // Auto-advance to next field if correct
    if (isCorrect) {
      // Small delay to show the green feedback
      setTimeout(() => {
        // Add navigation logic here if needed
      }, 100);
    }
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

  // Show completion message
  if (gameState.isComplete && gameState.problem) {
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
            {gameState.problem ? (
              <DivisionDisplay
                problem={gameState.problem}
                userAnswers={gameState.userAnswers}
                currentFocus={currentFocus}
                onAnswerSubmit={handleAnswerSubmit}
                onAnswerClear={clearAnswer}
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