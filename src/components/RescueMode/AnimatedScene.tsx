import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedSceneProps {
    dangerLevel: number; // 0-100, how close monster is
    rescueProgress: number; // 0-100, how close to rescue
    timeLeft: number;
    isComplete: boolean;
}

const AnimatedScene: React.FC<AnimatedSceneProps> = ({
    dangerLevel,
    rescueProgress,
    timeLeft,
    isComplete
}) => {
    const [characterPosition, setCharacterPosition] = useState(20);
    const [monsterPosition, setMonsterPosition] = useState(5);
    const [isEscaped, setIsEscaped] = useState(false);

    // Update positions based on game state
    useEffect(() => {
        // Character moves right as rescue progress increases
        const newCharacterPos = 20 + (rescueProgress * 0.6); // Max position around 80%
        setCharacterPosition(newCharacterPos);

        // Monster gets closer as danger increases
        const newMonsterPos = 5 + (dangerLevel * 0.5); // Max position around 55%
        setMonsterPosition(newMonsterPos);

        // Check if rescued
        if (rescueProgress >= 100) {
            setIsEscaped(true);
        }
    }, [dangerLevel, rescueProgress]);

    // Character states and animations
    const getCharacterState = () => {
        if (isComplete) return { emoji: '🎉', scale: 1.3, y: -10 };
        if (dangerLevel > 70) return { emoji: '😰', scale: 1.1, y: 0 };
        if (dangerLevel > 40) return { emoji: '😟', scale: 1.0, y: 0 };
        return { emoji: '👽', scale: 1.0, y: 0 };
    };

    const getMonsterState = () => {
        if (isComplete) return { emoji: '😴', scale: 0.8 };
        if (dangerLevel > 70) return { emoji: '👹', scale: 1.2 };
        if (dangerLevel > 40) return { emoji: '👺', scale: 1.1 };
        return { emoji: '👿', scale: 1.0 };
    };

    const characterState = getCharacterState();
    const monsterState = getMonsterState();

    return (
        <div className="relative w-full h-32 bg-gradient-to-r from-green-200 via-yellow-100 to-red-200 rounded-lg overflow-hidden border-2 border-gray-300">

            {/* Background elements */}
            <div className="absolute inset-0">
                {/* Ground */}
                <div className="absolute bottom-0 w-full h-4 bg-green-300"></div>

                {/* Trees/obstacles */}
                <motion.div
                    className="absolute bottom-4 left-[30%] text-2xl"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    🌳
                </motion.div>
                <motion.div
                    className="absolute bottom-4 left-[60%] text-xl"
                    animate={{ rotate: [0, 3, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                    🌲
                </motion.div>

                {/* Rescue ship (appears when close to completion) */}
                <AnimatePresence>
                    {rescueProgress > 60 && (
                        <motion.div
                            initial={{ x: 300, y: -20 }}
                            animate={{ x: characterPosition * 3.2, y: -10 }}
                            exit={{ x: 300, y: -50 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="absolute top-2 text-2xl"
                        >
                            🚁
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quicksand danger zone */}
                <motion.div
                    className="absolute bottom-0 left-0 bg-yellow-600 opacity-70"
                    animate={{
                        width: `${Math.max(10, dangerLevel)}%`,
                        height: `${Math.max(8, dangerLevel * 0.4)}px`
                    }}
                    transition={{ duration: 1 }}
                >
                    <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-full h-full bg-yellow-800 flex items-center justify-center text-xs text-yellow-200"
                    >
                        {dangerLevel > 30 && '💀 DANGER! 💀'}
                    </motion.div>
                </motion.div>
            </div>

            {/* Character (Zyx the Alien) */}
            <motion.div
                className="absolute bottom-4 text-3xl cursor-pointer"
                animate={{
                    x: `${characterPosition}%`,
                    scale: characterState.scale,
                    y: characterState.y,
                    rotate: isComplete ? [0, 360] : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    rotate: { duration: 1, repeat: isComplete ? Infinity : 0 }
                }}
                whileHover={{ scale: characterState.scale * 1.1 }}
                whileTap={{ scale: characterState.scale * 0.9 }}
            >
                <motion.div
                    animate={{
                        y: dangerLevel > 40 ? [0, -3, 0] : [0, -1, 0]
                    }}
                    transition={{
                        duration: dangerLevel > 40 ? 0.3 : 1,
                        repeat: Infinity
                    }}
                >
                    {characterState.emoji}
                </motion.div>

                {/* Character speech bubble */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-800 whitespace-nowrap border"
                >
                    {isComplete ? "I'm free!" :
                        dangerLevel > 70 ? "Help!" :
                            dangerLevel > 40 ? "Hurry!" :
                                "Keep going!"}
                </motion.div>
            </motion.div>

            {/* Monster */}
            <motion.div
                className="absolute bottom-4 text-3xl"
                animate={{
                    x: `${monsterPosition}%`,
                    scale: monsterState.scale,
                    rotate: isComplete ? 0 : [0, 5, -5, 0]
                }}
                transition={{
                    type: "spring",
                    stiffness: 50,
                    rotate: { duration: 1, repeat: isComplete ? 0 : Infinity }
                }}
            >
                <motion.div
                    animate={{
                        y: isComplete ? [0] : [0, -2, 0]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: isComplete ? 0 : Infinity
                    }}
                >
                    {monsterState.emoji}
                </motion.div>

                {/* Monster speech bubble */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-100 px-2 py-1 rounded-lg text-xs font-bold text-red-800 whitespace-nowrap border border-red-300"
                >
                    {isComplete ? "Zzz..." :
                        dangerLevel > 70 ? "Got you!" :
                            dangerLevel > 40 ? "Coming!" :
                                "Grrr..."}
                </motion.div>
            </motion.div>

            {/* Victory effects */}
            <AnimatePresence>
                {isComplete && (
                    <>
                        {/* Confetti */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    y: 50,
                                    x: Math.random() * 200,
                                    opacity: 1,
                                    scale: 1
                                }}
                                animate={{
                                    y: -20,
                                    x: Math.random() * 200,
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: 360
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.1,
                                    ease: "easeOut"
                                }}
                                className="absolute text-2xl"
                            >
                                {['🎉', '✨', '🎊', '⭐'][i % 4]}
                            </motion.div>
                        ))}

                        {/* Success message */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-green-200 bg-opacity-90 rounded-lg"
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-6xl mb-2"
                                >
                                    🏆
                                </motion.div>
                                <div className="text-lg font-bold text-green-800">
                                    MISSION SUCCESS!
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Time's up effect */}
            <AnimatePresence>
                {timeLeft <= 0 && !isComplete && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-red-200 bg-opacity-90 rounded-lg"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="text-4xl mb-2"
                            >
                                💥
                            </motion.div>
                            <div className="text-lg font-bold text-red-800">
                                TIME'S UP!
                            </div>
                            <div className="text-sm text-red-600 mt-1">
                                *BURP* - Back I come! 😄
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnimatedScene; 