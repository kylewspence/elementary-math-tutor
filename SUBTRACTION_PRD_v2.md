# Math Tutor Subtraction Feature - Product Requirements Document v2.0
*Architecture-First Implementation*

## Executive Summary

Add a subtraction operation to the Math Tutor application that **strictly follows the established shared architecture patterns**. This implementation prioritizes consistency with existing operations (Division, Addition, Multiplication) over unique features, ensuring seamless integration and preventing architectural drift.

**CORE PRINCIPLE**: Build subtraction to be **indistinguishable** from other operations in all shared behaviors, then selectively add operation-specific features only where truly necessary.

## Lessons Learned from Previous Implementation

### What Went Wrong
- **Architectural Drift**: Subtraction was developed in isolation without referencing established patterns
- **Custom UI Elements**: Added arrows, explanatory text, and visual indicators not present in other operations
- **Component Duplication**: Created custom submit logic instead of using shared components
- **Integration Gaps**: Missing automatic problem generation and focus management
- **Inconsistent UX**: Different behavior for mobile submit controls and validation feedback

### Prevention Strategy
This PRD enforces **consistency-first development** with explicit validation gates and reference implementation requirements.

## Current State Analysis

### Established Shared Architecture (MUST FOLLOW)
- **Shared Components**: `SubmitControls`, `Input`, problem header patterns
- **Shared Hooks**: `useSessionPersistence`, validation patterns, keyboard navigation structure
- **Integration Patterns**: App.tsx automatic generation effects, focus management, mode switching
- **UX Patterns**: Mobile sticky controls, loading states, edit-click behavior

### Critical Success Factors
1. **Visual Consistency**: Subtraction must look identical to other operations for all shared elements
2. **Behavioral Consistency**: All interactions must work identically (keyboard nav, submit, validation)
3. **Architectural Consistency**: Must use same hooks, components, and integration patterns
4. **Mobile Consistency**: Must work with existing mobile persistence and sticky controls

## Goals

### Primary Goals (In Priority Order)
1. **Architecture Compliance**: Subtraction follows ALL established patterns without deviation
2. **Seamless Integration**: Users cannot tell subtraction was added later - feels native
3. **Zero Regression**: Existing operations continue working unchanged
4. **Simple Borrowing**: Implement borrowing in the simplest way that maintains consistency

### Success Criteria
- **Visual Parity**: Subtraction looks identical to addition/multiplication for shared elements
- **Behavioral Parity**: All shared interactions work identically across operations  
- **Integration Parity**: Mode switching, problem generation, persistence work identically
- **Code Quality**: Subtraction implementation is indistinguishable from other operations in structure

## Technical Architecture

### MANDATORY: Reference Implementation Patterns

#### Component Structure (MUST MATCH)
```typescript
// Follow AdditionDisplay.tsx structure exactly:
// 1. Same imports and interface pattern
// 2. Same useEffect patterns for focus and editing
// 3. Same helper function patterns and naming
// 4. Same render structure (header, main content, shared controls)
// 5. Same loading/error/empty states
```

#### Hook Structure (MUST MATCH)
```typescript
// Follow useAdditionGameState.ts pattern exactly:
// 1. Same state interface structure
// 2. Same initialization pattern
// 3. Same problem generation flow
// 4. Same API integration approach
// 5. Same validation and completion logic
```

#### Integration Structure (MUST MATCH)
```typescript
// Follow App.tsx addition patterns exactly:
// 1. Same automatic generation useEffect
// 2. Same automatic focus useEffect  
// 3. Same handler patterns and naming
// 4. Same inclusion in initialization effects
// 5. Same auto-save integration
```

### Subtraction-Specific Types (Minimal Extensions)
```typescript
// src/types/subtraction.ts
// Keep identical to addition types where possible

export interface SubtractionProblem {
    minuend: number;
    subtrahend: number;
    difference: number;
    steps: SubtractionStep[];
    source?: 'api' | 'local';
    isEditable?: boolean;
}

export interface SubtractionStep {
    columnPosition: number;
    minuendDigit: number;
    subtrahendDigit: number;
    difference: number;
    needsBorrow: boolean;
    borrowedValue?: number; // Only if borrowing is implemented
}

export interface SubtractionUserAnswer {
    columnPosition: number;
    fieldType: 'difference'; // Start simple - only difference inputs
    value: number;
    isCorrect: boolean;
    timestamp: Date;
}

// Mirror addition exactly for consistency
export interface SubtractionCurrentFocus {
    columnPosition: number;
    fieldType: 'difference';
}

export interface SubtractionGameState {
    // Mirror AdditionGameState structure exactly
    currentLevel: number;
    completedLevels: number[];
    availableLevels: number[];
    currentProblemIndex: number;
    levelProblems: SubtractionProblem[];
    problem: SubtractionProblem | null;
    userAnswers: SubtractionUserAnswer[];
    currentFocus: SubtractionCurrentFocus;
    isSubmitted: boolean;
    isComplete: boolean;
    score: number;
    gameMode: 'subtraction';
}
```

## Implementation Strategy

### Phase 0: Architecture Audit & Shared Component Extraction
**CRITICAL**: Before any subtraction work, ensure shared architecture is solid

#### 0.1 Audit Current Shared Components
- [ ] Verify SubmitControls actually exists and is used by all operations
- [ ] Identify any duplicated submit logic that should be shared
- [ ] Document the exact patterns that subtraction must follow

#### 0.2 Strengthen Shared Architecture  
- [ ] Extract any remaining duplicated logic between operations
- [ ] Ensure all operations use identical patterns for shared behaviors
- [ ] Create reference documentation for new operation implementation

### Phase 1: Foundation (Consistency-First)
**GOAL**: Create subtraction that is visually and behaviorally identical to addition

#### 1.1 Basic Types and Utilities
- [ ] Create `src/types/subtraction.ts` mirroring addition types exactly
- [ ] Create `src/utils/subtractionGenerator.ts` following addition pattern
- [ ] Create `src/utils/subtractionValidator.ts` following addition pattern
- [ ] **VALIDATION GATE**: Types follow same patterns as addition

#### 1.2 Game State Hook (Copy Addition Pattern)
- [ ] Create `src/hooks/useSubtractionGameState.ts` by copying useAdditionGameState
- [ ] Replace addition-specific logic with subtraction equivalents
- [ ] Maintain identical interface and function signatures
- [ ] **VALIDATION GATE**: Hook structure is indistinguishable from addition

#### 1.3 Keyboard Navigation Hook (Copy Addition Pattern)  
- [ ] Create `src/hooks/useSubtractionKeyboardNav.ts` by copying useAdditionKeyboardNav
- [ ] Replace addition-specific field logic with subtraction equivalents
- [ ] Maintain identical navigation behavior and key handling
- [ ] **VALIDATION GATE**: Keyboard behavior is identical to addition

### Phase 2: Display Component (Visual Consistency)
**GOAL**: Create subtraction display that looks identical to addition for all shared elements

#### 2.1 Basic Display Structure
- [ ] Create `src/components/SubtractionProblem/SubtractionDisplay.tsx` by copying AdditionDisplay
- [ ] Replace addition-specific layout with simple subtraction layout (minuend - subtrahend = difference)
- [ ] **MUST USE**: Shared SubmitControls component
- [ ] **MUST MATCH**: Same header pattern, loading states, error states
- [ ] **VALIDATION GATE**: Visually indistinguishable from addition except for operation-specific math layout

#### 2.2 Math Layout (Subtraction-Specific)
- [ ] Implement simple subtraction layout: minuend, minus sign, subtrahend, line, difference inputs
- [ ] Use same grid constants and sizing as addition
- [ ] NO borrowing visualization initially - keep it simple
- [ ] **VALIDATION GATE**: Layout is clean and matches addition complexity level

### Phase 3: App Integration (Integration Parity)
**GOAL**: Subtraction integrates identically to other operations

#### 3.1 App.tsx Integration
- [ ] Add subtraction to GameMode type
- [ ] Add subtraction game state and handlers following addition pattern exactly
- [ ] **CRITICAL**: Copy automatic generation useEffect for subtraction
- [ ] **CRITICAL**: Copy automatic focus useEffect for subtraction  
- [ ] **CRITICAL**: Add subtraction to initialization useEffect
- [ ] **VALIDATION GATE**: Mode switching works seamlessly between all 4 operations

#### 3.2 Header Integration
- [ ] Add subtraction tab to Header component
- [ ] Match styling and behavior of other operation tabs
- [ ] **VALIDATION GATE**: Header looks and works identically

#### 3.3 Session Persistence
- [ ] Add subtractionState to GameProgress interface
- [ ] Include subtraction in auto-save logic
- [ ] **VALIDATION GATE**: Persistence works identically to other operations

### Phase 4: API Integration (Following Established Pattern)
- [ ] Add subtraction endpoints to apiService.ts following addition pattern
- [ ] Implement fallback to local generation following addition pattern
- [ ] **VALIDATION GATE**: API integration is indistinguishable from other operations

### Phase 5: Testing & Validation (Zero Regression)
**CRITICAL**: Comprehensive testing to ensure no architectural drift

#### 5.1 Consistency Validation
- [ ] **Visual Test**: Subtraction looks identical to other operations for shared elements
- [ ] **Behavioral Test**: All shared interactions work identically across all operations
- [ ] **Integration Test**: Mode switching, problem generation, persistence work identically
- [ ] **Mobile Test**: Mobile controls and persistence work identically

#### 5.2 Regression Testing
- [ ] Division still works perfectly
- [ ] Addition still works perfectly  
- [ ] Multiplication still works perfectly
- [ ] All shared components work across all operations
- [ ] Session persistence works for all operations

### Phase 6: Enhancement (FUTURE - After MVP Proven)
**Only after Phase 5 is completely successful and stable**

#### 6.1 Borrowing Visualization (Optional Enhancement)
- [ ] Research if borrowing visualization adds significant educational value
- [ ] If implementing, ensure it doesn't break shared architecture patterns
- [ ] Consider if similar enhancements should be added to addition carry logic
- [ ] **VALIDATION GATE**: Enhanced features don't break consistency

## Explicit Constraints & Requirements

### MANDATORY: Shared Component Usage
- [ ] **MUST USE**: SubmitControls from `/Shared` - no custom submit logic
- [ ] **MUST USE**: Input component with same variant logic as other operations
- [ ] **MUST FOLLOW**: Same problem header pattern (clickable edit)
- [ ] **MUST FOLLOW**: Same loading/error state patterns
- [ ] **NO CUSTOM**: Submit buttons, validation feedback, or UI elements not present in other operations

### MANDATORY: Integration Pattern Compliance
- [ ] **MUST HAVE**: Automatic problem generation useEffect (copy from addition)
- [ ] **MUST HAVE**: Automatic focus setting useEffect (copy from addition)
- [ ] **MUST HAVE**: Inclusion in mode initialization useEffect
- [ ] **MUST HAVE**: Same handler patterns and naming as other operations

### MANDATORY: Behavioral Consistency
- [ ] Keyboard navigation must work identically to other operations
- [ ] Submit flow must work identically to other operations
- [ ] Validation and error handling must work identically
- [ ] Mobile controls must work identically
- [ ] Problem editing must work identically

### FORBIDDEN: Architectural Deviations
- [ ] **NO CUSTOM**: UI elements not present in other operations (arrows, explanatory text, etc.)
- [ ] **NO CUSTOM**: Submit button logic or positioning
- [ ] **NO CUSTOM**: Validation feedback patterns
- [ ] **NO CUSTOM**: Loading or error state handling
- [ ] **NO DEVIATION**: From established keyboard navigation patterns

## Validation Gates

### Gate 1: Foundation Validation
**Before proceeding to display component:**
- [ ] Types follow same structure as addition types
- [ ] Hooks follow same patterns as addition hooks
- [ ] No unique architectural patterns introduced

### Gate 2: Display Validation  
**Before proceeding to integration:**
- [ ] Display component uses all shared components correctly
- [ ] Visual appearance matches other operations for shared elements
- [ ] No custom UI elements that don't exist elsewhere

### Gate 3: Integration Validation
**Before proceeding to API work:**
- [ ] Mode switching works seamlessly between all 4 operations
- [ ] Automatic generation and focus work identically
- [ ] No regression in existing operations

### Gate 4: Completion Validation
**Before considering subtraction complete:**
- [ ] All shared behaviors work identically across all operations
- [ ] Mobile experience is consistent
- [ ] Session persistence works for all operations
- [ ] Zero architectural drift from established patterns

## Success Metrics

### Architecture Compliance
- [ ] Subtraction implementation is indistinguishable from other operations in structure
- [ ] No unique patterns or components introduced
- [ ] All shared behaviors work identically

### User Experience Consistency
- [ ] Users cannot tell subtraction was added later
- [ ] All interactions work identically across operations
- [ ] Mobile experience is seamless

### Code Quality
- [ ] Same patterns, naming, and structure as existing operations
- [ ] No duplication of shared logic
- [ ] Easy to maintain and extend

This PRD ensures that subtraction will be implemented with surgical precision, following established patterns exactly and preventing the architectural drift that can occur when new features are developed in isolation. 