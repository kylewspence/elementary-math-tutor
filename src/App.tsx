import { useEffect, useState } from 'react';
import CompactHeader from './components/Header/CompactHeader';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import PetZone from './components/Pet/PetZone';
import PetCollectionBar from './components/Pet/PetCollectionBar';
import MenuDrawer from './components/Navigation/MenuDrawer';
import { useGameState } from './hooks/useGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { usePetSystem } from './hooks/usePetSystem';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [petTrigger, setPetTrigger] = useState<'correct' | 'wrong' | undefined>();

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
  } = useGameState();

  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
  } = useKeyboardNav(gameState.problem, gameState.userAnswers, gameState.isSubmitted);

  const {
    petState,
    feedPet,
    playWithPet,
    switchPet,
    handleCorrectAnswer,
    handleWrongAnswer,
    handleCompleteProblem,
    canAffordAction,
  } = usePetSystem();

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

  // Handle answer submission WITHOUT pet integration (just store the answer)
  const handleAnswerSubmit = (answer: any) => {
    submitAnswer(answer);
    // Don't trigger pet reactions here - answers aren't validated yet!
  };

  // Handle problem submission 
  const handleProblemSubmit = () => {
    submitProblem();
    // Pet reactions will be handled by useEffect below
  };

  // Watch for problem submission and apply pet reactions based on validation results
  useEffect(() => {
    if (gameState.isSubmitted && gameState.problem) {
      // Count correct and wrong answers from the validation
      const correctAnswers = gameState.userAnswers.filter(answer => answer.isCorrect).length;
      const wrongAnswers = gameState.userAnswers.filter(answer => !answer.isCorrect).length;

      // Apply pet reactions based on validation results
      for (let i = 0; i < correctAnswers; i++) {
        handleCorrectAnswer();
      }
      for (let i = 0; i < wrongAnswers; i++) {
        handleWrongAnswer();
      }

      // Bonus for completing the problem + trigger celebration animation
      if (gameState.isComplete) {
        handleCompleteProblem();
        setPetTrigger('correct');
        setTimeout(() => setPetTrigger(undefined), 2000);
      } else if (wrongAnswers > 0) {
        // Show disappointment if there were wrong answers
        setPetTrigger('wrong');
        setTimeout(() => setPetTrigger(undefined), 1500);
      }
    }
  }, [gameState.isSubmitted, gameState.isComplete, gameState.userAnswers, handleCorrectAnswer, handleWrongAnswer, handleCompleteProblem]);

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
    setIsMenuOpen(false);
  };

  // Calculate progress for current level
  const levelProgress = (gameState.currentProblem / gameState.totalProblems) * 100;

  // Show completion message for non-pet mode
  if (gameState.isComplete && gameState.problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <CompactHeader
          currentLevel={gameState.currentLevel}
          totalLevels={10}
          progress={100}
          treats={petState.treats}
          onMenuToggle={() => setIsMenuOpen(true)}
        />
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
              <p className="text-green-600 mb-6">
                Your pet {petState.activePet.name} is proud of you! 🐲✨
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <CompactHeader
        currentLevel={gameState.currentLevel}
        totalLevels={10}
        progress={levelProgress}
        treats={petState.treats}
        onMenuToggle={() => setIsMenuOpen(true)}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Division Problem Area - Left */}
          <div className="order-2 lg:order-1">
            {gameState.problem ? (
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
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
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">🔄</div>
                  <p>Loading problem...</p>
                </div>
              </div>
            )}
          </div>

          {/* Pet Zone - Right */}
          <div className="order-1 lg:order-2">
            <PetZone
              pet={petState.activePet}
              onFeed={feedPet}
              onPlay={playWithPet}
              canAffordFeed={canAffordAction('feed')}
              canAffordPlay={canAffordAction('play')}
              trigger={petTrigger}
            />
          </div>
        </div>

        {/* Pet Collection Bar */}
        <div className="mt-6 max-w-7xl mx-auto">
          <PetCollectionBar
            ownedPets={petState.ownedPets}
            activePetId={petState.activePet.id}
            onSwitchPet={switchPet}
            totalProblemsCompleted={petState.totalProblemsCompleted}
            currentLevel={gameState.currentLevel}
          />
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

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        gameState={gameState}
        onLevelSelect={handleLevelSelect}
      />
    </div>
  );
}

export default App;