import { useEffect, useCallback } from 'react';
import type { DivisionProblem, GameMode } from '../types/game';
import type { AdditionProblem } from '../types/addition';
import type { MultiplicationProblem } from '../types/multiplication';
import type { SubtractionProblem } from '../types/subtraction';

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

interface SavedSubtractionState {
    currentLevel: number;
    currentProblemIndex: number;
    levelProblems: SubtractionProblem[];
}

// Progress interface for all game modes
interface GameProgress {
    gameMode: GameMode;
    divisionState?: SavedDivisionState;
    additionState?: SavedAdditionState;
    multiplicationState?: SavedMultiplicationState;
    subtractionState?: SavedSubtractionState;
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
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (error) {
            // Failed to save progress
        }
    }, []);

    // Load saved progress from sessionStorage
    const loadProgress = useCallback((): GameProgress | null => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            const result = saved ? JSON.parse(saved) : null;
            return result;
        } catch (error) {
            // Failed to load progress
            return null;
        }
    }, []);

    // Listen for visibility changes to auto-save and auto-restore
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Trigger auto-save event when tab is backgrounded

                window.dispatchEvent(new CustomEvent('autoSaveProgress'));
            } else if (document.visibilityState === 'visible') {
                // Re-enable auto-restore to fix progress persistence

                window.dispatchEvent(new CustomEvent('autoRestoreProgress'));
            }
        };

        const handleBeforeUnload = () => {
            // Trigger auto-save event (desktop browsers)
            window.dispatchEvent(new CustomEvent('autoSaveProgress'));
        };

        const handlePageHide = () => {
            // Trigger auto-save event (mobile browsers - more reliable than beforeunload)

            window.dispatchEvent(new CustomEvent('autoSaveProgress'));
        };

        // Add all event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, []);

    return {
        saveProgress,
        loadProgress,
    };
} 