import React, { useState, useEffect } from 'react';
import type { GameState } from '../../types/game';
import AnimatedScene from './AnimatedScene';

interface RescueModeProps {
    gameState: GameState;
    onComplete?: () => void;
}

const RescueMode: React.FC<RescueModeProps> = ({ gameState, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [problemsSolved, setProblemsSolved] = useState(0);
    const [rescueProgress, setRescueProgress] = useState(0);
    const [completedProblems, setCompletedProblems] = useState(new Set<string>());

    const problemsNeeded = 8; // Need to solve 8 problems to rescue the character
    const totalTime = 600; // 10 minutes total

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up!
                    onComplete?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    // Update progress when a problem is completed
    useEffect(() => {
        // Create unique identifier for current problem
        const problemId = `${gameState.currentLevel}-${gameState.currentProblem}`;

        // Check if this problem is complete and we haven't counted it yet
        if (gameState.isComplete && gameState.isSubmitted && !completedProblems.has(problemId)) {
            setCompletedProblems(prev => new Set([...prev, problemId]));

            setProblemsSolved(prev => {
                const newCount = prev + 1;
                setRescueProgress((newCount / problemsNeeded) * 100);

                if (newCount >= problemsNeeded) {
                    // Rescue successful!
                    onComplete?.();
                }

                return newCount;
            });
        }
    }, [gameState.isComplete, gameState.isSubmitted, gameState.currentLevel, gameState.currentProblem, completedProblems, onComplete]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate danger level (higher as time runs out)
    const dangerLevel = Math.max(0, 100 - (timeLeft / totalTime) * 100);

    return (
        <div className="rescue-mode bg-gradient-to-b from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200 h-fit sticky top-4">

            {/* Mission Header */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-blue-800 mb-2">
                    🚨 RESCUE MISSION 🚨
                </h2>
                <p className="text-sm text-blue-700">
                    Zyx the Alien is trapped in quicksand! Solve problems to power the rescue device!
                </p>
            </div>

            {/* Mission Stats */}
            <div className="space-y-3 mb-4">

                {/* Timer */}
                <div className="bg-white p-3 rounded-lg border-2 border-red-200">
                    <div className="text-center">
                        <div className="text-xl font-bold text-red-600">
                            ⏰ {formatTime(timeLeft)}
                        </div>
                        <div className="text-xs text-red-500">Time Remaining</div>
                    </div>
                </div>

                {/* Problems Solved */}
                <div className="bg-white p-3 rounded-lg border-2 border-green-200">
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                            ✅ {problemsSolved}/{problemsNeeded}
                        </div>
                        <div className="text-xs text-green-500">Problems Solved</div>
                    </div>
                </div>

                {/* Rescue Progress */}
                <div className="bg-white p-3 rounded-lg border-2 border-blue-200">
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                            🚀 {Math.round(rescueProgress)}%
                        </div>
                        <div className="text-xs text-blue-500">Rescue Power</div>
                    </div>
                </div>
            </div>

            {/* Animated Chase Scene */}
            <div className="mb-4">
                <AnimatedScene
                    dangerLevel={dangerLevel}
                    rescueProgress={rescueProgress}
                    timeLeft={timeLeft}
                    isComplete={rescueProgress >= 100}
                />
            </div>



            {/* Mission Status */}
            <div className="text-center">
                {rescueProgress >= 100 ? (
                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-800">
                            🎉 SUCCESS! 🎉
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                            You saved Zyx! Your math skills are heroic!
                        </div>
                    </div>
                ) : timeLeft <= 0 ? (
                    <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3">
                        <div className="text-lg font-bold text-red-800">
                            ⏰ TIME'S UP! ⏰
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                            Zyx got swallowed but burped right back out! Try again?
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
                        <div className="text-sm font-semibold text-blue-800">
                            💪 Keep solving to charge the rescue device!
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                            Every correct answer brings Zyx closer to safety!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RescueMode; 