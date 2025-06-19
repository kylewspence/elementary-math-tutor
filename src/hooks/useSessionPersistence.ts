import { useEffect, useCallback } from 'react';
import type { DivisionProblem } from '../types/game';
import type { AdditionProblem } from '../types/addition';
import type { MultiplicationProblem } from '../types/multiplication';

// State we want to persist for each game mode - now with specific types
interface SavedDivisionState {
    currentLevel: number;
    currentProblemIndex: number;
    levelProblems: DivisionProblem[];
}

interface SavedAdditionState {
    currentLevel: number;
    currentProblemIndex: number;
    levelProblems: AdditionProblem[];
}

interface SavedMultiplicationState {
    currentLevel: number;
    currentProblemIndex: number;
    levelProblems: MultiplicationProblem[];
}

// Progress interface for all game modes
interface GameProgress {
    gameMode: 'division' | 'addition' | 'multiplication';
    divisionState?: SavedDivisionState;
    additionState?: SavedAdditionState;
    multiplicationState?: SavedMultiplicationState;
}

const STORAGE_KEY = 'mathTutorProgress';

/**
 * Hook to save/restore game progress using sessionStorage
 * Saves level, problem index, and problems array
 * Does NOT save user answers or submission state (fresh start each time)
 */
export function useSessionPersistence() {
    // Save progress to sessionStorage
    const saveProgress = useCallback((progress: GameProgress) => {
        try {
            console.log('Saving progress to sessionStorage:', progress);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            console.log('Progress saved successfully');
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }, []);

    // Load saved progress from sessionStorage
    const loadProgress = useCallback((): GameProgress | null => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            const result = saved ? JSON.parse(saved) : null;
            console.log('Loaded progress from sessionStorage:', result);
            return result;
        } catch (error) {
            console.warn('Failed to load progress:', error);
            return null;
        }
    }, []);

    // Listen for visibility changes to auto-save and auto-restore
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Trigger auto-save event
                console.log('Tab hidden, triggering auto-save');
                window.dispatchEvent(new CustomEvent('autoSaveProgress'));
            } else if (document.visibilityState === 'visible') {
                // Trigger auto-restore event
                console.log('Tab visible, triggering auto-restore');
                window.dispatchEvent(new CustomEvent('autoRestoreProgress'));
            }
        };

        const handleBeforeUnload = () => {
            // Trigger auto-save event
            console.log('Before unload, triggering auto-save');
            window.dispatchEvent(new CustomEvent('autoSaveProgress'));
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return {
        saveProgress,
        loadProgress,
    };
} 