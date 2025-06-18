import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import LevelSelectorDrawer from './components/LevelSelector/LevelSelectorDrawer';
import DivisionDisplay from './components/DivisionProblem/DivisionDisplay';
import AdditionDisplay from './components/AdditionProblem/AdditionDisplay';
import { useMathGameState } from './hooks/useMathGameState';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { useAdditionGameState } from './hooks/useAdditionGameState';
import { useAdditionKeyboardNav } from './hooks/useAdditionKeyboardNav';
import { useMultiplicationGameState } from './hooks/useMultiplicationGameState';
import type { UserAnswer, DivisionProblem } from './types/game';
import type { AdditionUserAnswer } from './types/addition';
import { generateProblem, validateAnswer, isProblemComplete } from './utils/problemGenerator';
import { generateAdditionProblem, validateAdditionAnswer, isAdditionProblemComplete } from './utils/additionProblemGenerator';
import { generateMultiplicationProblem, validateMultiplicationAnswer, isMultiplicationProblemComplete } from './utils/multiplicationProblemGenerator';
import MultiplicationDisplay from './components/MultiplicationProblem/MultiplicationDisplay';

type MathOperation = 'division' | 'addition' | 'multiplication';

function App() {
  const [selectedOperation, setSelectedOperation] = useState<MathOperation>('division');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Division game state
  const {
    gameState,
    generateNewProblem,
    submitAnswer,
    clearAnswer,
    submitProblem: handleProblemSubmit,
    nextProblem,
    resetProblem,
    jumpToLevel,
    enableEditing,
    disableEditing
  } = useMathGameState<DivisionProblem, UserAnswer>({
    generateProblem,
    validateAnswer,
    isProblemComplete,
    initialLevel: 1,
  });

  // Addition game state
  const {
    gameState: additionGameState,
    generateNewProblem: generateNewAdditionProblem,
    submitAnswer: submitAdditionAnswer,
    submitProblem: handleAdditionProblemSubmit,
    nextProblem: nextAdditionProblem,
    resetProblem: resetAdditionProblem,
    jumpToLevel: jumpToAdditionLevel,
  } = useAdditionGameState();

  // Multiplication game state
  const {
    gameState: multiplicationGameState,
    generateNewProblem: generateNewMultiplicationProblem,
    submitAnswer: submitMultiplicationAnswer,
    submitProblem: handleMultiplicationProblemSubmit,
    nextProblem: nextMultiplicationProblem,
    resetProblem: resetMultiplicationProblem,
    jumpToLevel: jumpToMultiplicationLevel,
  } = useMultiplicationGameState();

  // Division keyboard navigation
  const {
    currentFocus,
    handleKeyDown,
    jumpToField,
  } = useKeyboardNav(
    gameState.problem as DivisionProblem | null,
    gameState.userAnswers,
    gameState.isSubmitted
  );

  const handleKeyboardNav = (e: React.KeyboardEvent) => {
    handleKeyDown(e);
  };

  const handleFieldClick = (stepNumber: number, fieldType: 'quotient' | 'multiply' | 'subtract' | 'bringDown', position: number = 0) => {
    jumpToField(stepNumber, fieldType, position);
  };

  // Addition keyboard navigation  
  const {
    currentFocus: additionCurrentFocus,
    handleKeyDown: handleAdditionKeyDown,
    jumpToField: jumpToAdditionField,
  } = useAdditionKeyboardNav(
    additionGameState.problem,
    additionGameState.userAnswers,
    additionGameState.isSubmitted
  );

  const handleAdditionKeyboardNav = (e: React.KeyboardEvent) => {
    handleAdditionKeyDown(e);
  };

  const handleAdditionFieldClick = (columnPosition: number, fieldType: 'sum' | 'carry') => {
    jumpToAdditionField({ columnPosition, fieldType });
  };

  // Handle tab changes
  const handleTabChange = (operation: MathOperation) => {
    setSelectedOperation(operation);
  };

  // Handle level changes
  const handleLevelChange = (level: number) => {
    switch (selectedOperation) {
      case 'division':
        jumpToLevel(level);
        break;
      case 'addition':
        jumpToAdditionLevel(level);
        break;
      case 'multiplication':
        jumpToMultiplicationLevel(level);
        break;
    }
    setIsDrawerOpen(false);
  };

  // Handle generating new problems
  const handleGenerateNew = () => {
    switch (selectedOperation) {
      case 'division':
        generateNewProblem();
        break;
      case 'addition':
        generateNewAdditionProblem();
        break;
      case 'multiplication':
        generateNewMultiplicationProblem();
        break;
    }
  };

  // Handle problem reset
  const handleReset = () => {
    switch (selectedOperation) {
      case 'division':
        resetProblem();
        break;
      case 'addition':
        resetAdditionProblem();
        break;
      case 'multiplication':
        resetMultiplicationProblem();
        break;
    }
  };

  // Handle moving to next problem
  const handleNextProblem = () => {
    switch (selectedOperation) {
      case 'division':
        nextProblem();
        break;
      case 'addition':
        nextAdditionProblem();
        break;
      case 'multiplication':
        nextMultiplicationProblem();
        break;
    }
  };

  // Get current level based on selected operation
  const getCurrentLevel = () => {
    switch (selectedOperation) {
      case 'division':
        return gameState.currentLevel;
      case 'addition':
        return additionGameState.currentLevel;
      case 'multiplication':
        return multiplicationGameState.currentLevel;
      default:
        return 1;
    }
  };

  // Get current score based on selected operation
  const getCurrentScore = () => {
    switch (selectedOperation) {
      case 'division':
        return gameState.score;
      case 'addition':
        return additionGameState.score;
      case 'multiplication':
        return multiplicationGameState.score;
      default:
        return 0;
    }
  };

  const currentLevel = getCurrentLevel();
  const currentScore = getCurrentScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        selectedTab={selectedOperation}
        onTabChange={handleTabChange}
        currentLevel={currentLevel}
        score={currentScore}
        onOpenLevelSelector={() => setIsDrawerOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {selectedOperation === 'division' && (
          <DivisionDisplay
            problem={gameState.problem}
            userAnswers={gameState.userAnswers}
            currentFocus={currentFocus}
            isSubmitted={gameState.isSubmitted}
            isComplete={gameState.isComplete}
            isEditable={gameState.isEditable}
            onAnswerSubmit={submitAnswer}
            onAnswerClear={clearAnswer}
            onProblemSubmit={handleProblemSubmit}
            onFieldClick={handleFieldClick}
            onKeyDown={handleKeyboardNav}
            onNextProblem={handleNextProblem}
            onReset={handleReset}
            onGenerateNew={handleGenerateNew}
            onEnableEditing={enableEditing}
            onDisableEditing={disableEditing}
          />
        )}

        {selectedOperation === 'addition' && (
          <AdditionDisplay
            problem={additionGameState.problem}
            userAnswers={additionGameState.userAnswers}
            currentFocus={additionCurrentFocus}
            isSubmitted={additionGameState.isSubmitted}
            isComplete={additionGameState.isComplete}
            isEditable={additionGameState.isEditable}
            onAnswerSubmit={submitAdditionAnswer}
            onProblemSubmit={handleAdditionProblemSubmit}
            onFieldClick={handleAdditionFieldClick}
            onKeyDown={handleAdditionKeyboardNav}
            onNextProblem={handleNextProblem}
            onReset={handleReset}
            onGenerateNew={handleGenerateNew}
          />
        )}

        {selectedOperation === 'multiplication' && (
          <MultiplicationDisplay
            problem={multiplicationGameState.problem}
            userAnswers={multiplicationGameState.userAnswers}
            isSubmitted={multiplicationGameState.isSubmitted}
            isComplete={multiplicationGameState.isComplete}
            isEditable={multiplicationGameState.isEditable}
            onAnswerSubmit={submitMultiplicationAnswer}
            onProblemSubmit={handleMultiplicationProblemSubmit}
            onNextProblem={handleNextProblem}
            onReset={handleReset}
            onGenerateNew={handleGenerateNew}
          />
        )}
      </main>

      <LevelSelectorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentLevel={currentLevel}
        onLevelSelect={handleLevelChange}
        operation={selectedOperation}
      />
    </div>
  );
}

export default App;