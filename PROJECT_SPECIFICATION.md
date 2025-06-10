# Math Tutor - Long Division Learning App

## Project Overview
A clean, focused long division learning application that progresses students through increasingly difficult problems across multiple levels.

## Core Requirements

### Phase 1: Basic Layout
- Clean header bar with "Math Tutor" title
- Minimal, distraction-free design
- Responsive layout using Tailwind CSS

### Phase 2: Level System
- **Level Progression**: 4 levels of increasing difficulty
- **Problems Per Level**: 10 problems per level
- **Progress Tracking**: Current level display (e.g., "Current Level: 3/10")
- **Level Selection**: Visual level selector showing progress

### Difficulty Progression
- **Level 1**: Single digit divisor, 2-digit dividend (e.g., 84 ÷ 4)
- **Level 2**: Single digit divisor, 3-digit dividend (e.g., 156 ÷ 3)
- **Level 3**: Single digit divisor, 4-digit dividend (e.g., 1248 ÷ 6)
- **Level 4**: Two digit divisor, 3-4 digit dividend (e.g., 1456 ÷ 13)

### Division Interface
- **Clean Layout**: Traditional long division visual format
- **Input Boxes**: Only where students need to type answers
- **Expected Steps**: Number of input boxes matches required calculation steps
- **Keyboard Navigation**: Tab/Enter to move between fields
- **Validation**: Immediate feedback (green=correct, red=incorrect)

## Technical Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **State Management**: React hooks (useState, useEffect)

### Component Structure
```
src/
├── components/
│   ├── Header/
│   │   └── Header.tsx                 # "Math Tutor" title bar
│   ├── LevelSelector/
│   │   ├── LevelSelector.tsx          # Level selection sidebar
│   │   └── LevelProgress.tsx          # Progress within current level
│   ├── DivisionProblem/
│   │   ├── DivisionDisplay.tsx        # Clean division layout
│   │   └── InputField.tsx             # Individual input boxes
│   └── UI/
│       └── Input.tsx                  # Base input component
├── hooks/
│   ├── useGameState.ts                # Level/problem progression
│   ├── useDivisionProblem.ts          # Problem generation & validation
│   └── useKeyboardNav.ts              # Input field navigation
├── utils/
│   ├── problemGenerator.ts            # Generate problems by difficulty
│   ├── divisionValidator.ts           # Check student answers
│   └── constants.ts                   # Level configs, UI constants
└── types/
    └── game.ts                        # TypeScript interfaces
```

### Key Features
1. **Problem Generation**: Automatic generation of appropriate difficulty problems
2. **Step Validation**: Real-time checking of each calculation step
3. **Progress Persistence**: Track which level/problem user is on
4. **Keyboard-First**: Optimized for numpad and keyboard navigation
5. **Clean Feedback**: Minimal, helpful error messages

## User Experience Flow

### 1. App Start
- Show "Math Tutor" header
- Display current level progress (e.g., "Current Level: 1/10")
- Show level selector with progress indicators
- Generate first problem for current level

### 2. Problem Solving
- Student sees clean division layout with empty input boxes
- Student types answers using keyboard/numpad
- Tab/Enter moves to next input field
- Immediate validation feedback (green/red highlighting)
- On correct completion, advance to next problem

### 3. Level Progression
- After 10 correct problems in a level, advance to next level
- Show brief celebration/progress message
- Reset problem counter to 1/10 for new level
- Generate harder problems for new level

### 4. Completion
- After completing all 4 levels, show completion message
- Option to restart or continue practicing

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Set up React + TypeScript + Tailwind project
- [ ] Create clean header component
- [ ] Basic app layout structure

### Phase 2: Core Game Logic
- [ ] Implement level/problem state management
- [ ] Create problem generator with difficulty scaling
- [ ] Build clean division display component
- [ ] Add input validation system

### Phase 3: User Interface
- [ ] Level selector with progress tracking
- [ ] Keyboard navigation between input fields
- [ ] Visual feedback for correct/incorrect answers
- [ ] Problem progression logic

### Phase 4: Polish & Testing
- [ ] Smooth transitions between problems/levels
- [ ] Responsive design optimization
- [ ] Accessibility improvements
- [ ] Performance optimization

## Success Criteria
- Students can progress through 4 levels of increasing difficulty
- Clean, distraction-free interface promotes focus on learning
- Keyboard-first navigation works smoothly
- Problems are generated appropriately for each difficulty level
- Progress is clearly communicated and motivating

## Non-Goals (Removed)
- ~~Complex hint systems~~
- ~~Detailed step-by-step guidance~~
- ~~Multiple validation feedback modes~~
- ~~Extensive help documentation~~
- ~~Complex progress analytics~~

The focus is on simplicity, clarity, and effective learning through practice. 