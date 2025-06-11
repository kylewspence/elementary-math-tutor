import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pet } from '../../types/pet';
import { PET_TYPES } from '../../utils/petData';

interface PetAnimationProps {
    pet: Pet;
    happiness: number;
    isActive: boolean;
    trigger?: 'correct' | 'wrong' | 'feed' | 'play';
}

const PetAnimation: React.FC<PetAnimationProps> = ({
    pet,
    happiness,
    isActive,
    trigger,
}) => {
    const [animationState, setAnimationState] = useState<string>('idle');
    const [position, setPosition] = useState({ x: 50, y: 70 });
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [idleBehavior, setIdleBehavior] = useState<string>('standing');

    const petConfig = PET_TYPES[pet.type];

    // Animation variants for different states
    const containerVariants = {
        idle: {
            y: [0, -8, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        celebrate: {
            y: [0, -40, -20, -40, 0],
            scale: [1, 1.2, 1.1, 1.2, 1],
            rotate: [0, -5, 5, -5, 0],
            transition: {
                duration: 2,
                ease: "easeOut"
            }
        },
        disappointed: {
            y: [0, 5, 0],
            scale: [1, 0.9, 1],
            transition: {
                duration: 1.5,
                ease: "easeInOut"
            }
        },
        eating: {
            scale: [1, 1.1, 1],
            y: [0, -5, 0],
            transition: {
                duration: 0.5,
                repeat: 5,
                ease: "easeInOut"
            }
        },
        playing: {
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            transition: {
                duration: 2,
                ease: "easeInOut"
            }
        }
    };

    // Get mood-based facial expression
    const getFacialExpression = () => {
        if (trigger === 'correct') return '😄';
        if (trigger === 'wrong') return '😞';
        if (trigger === 'feed') return '😋';
        if (trigger === 'play') return '😆';

        if (happiness > 80) return '😊';
        if (happiness > 60) return '🙂';
        if (happiness > 40) return '😐';
        if (happiness > 20) return '😟';
        return '😢';
    };

    // Handle trigger effects
    useEffect(() => {
        if (trigger) {
            switch (trigger) {
                case 'correct':
                    setAnimationState('celebrate');
                    setTimeout(() => setAnimationState('idle'), 2000);
                    break;
                case 'wrong':
                    setAnimationState('disappointed');
                    setTimeout(() => setAnimationState('idle'), 1500);
                    break;
                case 'feed':
                    setAnimationState('eating');
                    setTimeout(() => setAnimationState('idle'), 2500);
                    break;
                case 'play':
                    setAnimationState('playing');
                    setTimeout(() => setAnimationState('idle'), 2000);
                    break;
            }
        }
    }, [trigger]);

    // Idle movement system
    useEffect(() => {
        if (animationState === 'idle') {
            const moveInterval = setInterval(() => {
                const behaviors = ['standing', 'walking', 'sitting'];
                const weights = happiness > 60 ? [30, 50, 20] : [40, 30, 30];

                const random = Math.random() * 100;
                let behavior = 'standing';
                let cumulative = 0;

                for (let i = 0; i < behaviors.length; i++) {
                    cumulative += weights[i];
                    if (random <= cumulative) {
                        behavior = behaviors[i];
                        break;
                    }
                }

                setIdleBehavior(behavior);

                if (behavior === 'walking') {
                    const newX = Math.random() * 60 + 20;
                    const newY = Math.random() * 20 + 60;
                    setDirection(newX > position.x ? 'right' : 'left');
                    setPosition({ x: newX, y: newY });
                }
            }, 4000 + Math.random() * 3000);

            return () => clearInterval(moveInterval);
        }
    }, [animationState, position.x, happiness]);

    // Pet sprite component
    const PetSprite = () => {
        const baseSize = pet.stage === 'egg' ? 40 : pet.stage === 'baby' ? 50 : pet.stage === 'juvenile' ? 60 : pet.stage === 'adult' ? 70 : 80;

        const spriteVariants = {
            idle: {
                scaleX: direction === 'left' ? -1 : 1,
                transition: { duration: 0.3 }
            }
        };

        const wingVariants = {
            flap: {
                scaleY: [1, 1.4, 1],
                opacity: [0.7, 1, 0.7],
                transition: {
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }
        };

        const tailVariants = {
            wag: {
                rotate: [-15, 15, -15],
                transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }
        };

        switch (pet.type) {
            case 'dragon':
                return (
                    <motion.div
                        className="relative"
                        variants={spriteVariants}
                        animate="idle"
                        style={{ width: baseSize * 1.8, height: baseSize * 1.5 }}
                    >
                        {/* Dragon Body - More elongated and distinctive */}
                        <motion.div
                            className="absolute bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full border-2 border-red-700"
                            style={{
                                width: baseSize * 0.9,
                                height: baseSize * 0.7,
                                left: baseSize * 0.4,
                                top: baseSize * 0.4,
                                boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.3)'
                            }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Dragon Belly */}
                            <div
                                className="absolute bg-gradient-to-b from-orange-200 to-yellow-200 rounded-full"
                                style={{
                                    width: baseSize * 0.5,
                                    height: baseSize * 0.4,
                                    left: '50%',
                                    top: '60%',
                                    transform: 'translateX(-50%)'
                                }}
                            />
                        </motion.div>

                        {/* Dragon Head - More dragon-like shape */}
                        <motion.div
                            className="absolute bg-gradient-to-br from-red-600 via-orange-600 to-red-700 border-2 border-red-800"
                            style={{
                                width: baseSize * 0.7,
                                height: baseSize * 0.6,
                                borderRadius: '60% 40% 50% 50%', // More dragon-like head shape
                                top: baseSize * 0.1,
                                left: baseSize * 0.5,
                                boxShadow: '2px 2px 6px rgba(0,0,0,0.4)'
                            }}
                            animate={{
                                rotate: idleBehavior === 'walking' ? [0, 3, 0, -3, 0] : 0
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {/* Dragon Snout */}
                            <div
                                className="absolute bg-gradient-to-r from-orange-400 to-red-500 border border-red-600"
                                style={{
                                    width: baseSize * 0.3,
                                    height: baseSize * 0.25,
                                    borderRadius: '50% 80% 50% 80%',
                                    right: -baseSize * 0.1,
                                    top: '40%'
                                }}
                            />

                            {/* Dragon Eyes - More dramatic */}
                            <motion.div
                                className="absolute bg-yellow-300 rounded-full border-2 border-orange-600"
                                style={{
                                    width: baseSize * 0.12,
                                    height: baseSize * 0.12,
                                    top: baseSize * 0.15,
                                    left: baseSize * 0.15
                                }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <div
                                    className="w-full h-full bg-red-800 rounded-full"
                                    style={{ transform: 'scale(0.6)' }}
                                />
                            </motion.div>
                            <motion.div
                                className="absolute bg-yellow-300 rounded-full border-2 border-orange-600"
                                style={{
                                    width: baseSize * 0.12,
                                    height: baseSize * 0.12,
                                    top: baseSize * 0.15,
                                    right: baseSize * 0.25
                                }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0.1 }}
                            >
                                <div
                                    className="w-full h-full bg-red-800 rounded-full"
                                    style={{ transform: 'scale(0.6)' }}
                                />
                            </motion.div>

                            {/* Dragon Horns */}
                            <div
                                className="absolute bg-gradient-to-t from-gray-600 to-gray-300"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `${baseSize * 0.06}px solid transparent`,
                                    borderRight: `${baseSize * 0.06}px solid transparent`,
                                    borderBottom: `${baseSize * 0.2}px solid #6b7280`,
                                    top: -baseSize * 0.1,
                                    left: baseSize * 0.2
                                }}
                            />
                            <div
                                className="absolute bg-gradient-to-t from-gray-600 to-gray-300"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `${baseSize * 0.06}px solid transparent`,
                                    borderRight: `${baseSize * 0.06}px solid transparent`,
                                    borderBottom: `${baseSize * 0.2}px solid #6b7280`,
                                    top: -baseSize * 0.1,
                                    right: baseSize * 0.3
                                }}
                            />

                            {/* Face Expression */}
                            <motion.div
                                className="absolute text-lg font-bold"
                                style={{
                                    top: baseSize * 0.35,
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.3 }}
                                key={getFacialExpression()}
                            >
                                {getFacialExpression()}
                            </motion.div>
                        </motion.div>

                        {/* Dragon Wings - More wing-like */}
                        <motion.div
                            className="absolute bg-gradient-to-br from-orange-400 via-red-400 to-orange-600 border-2 border-red-600"
                            style={{
                                width: baseSize * 0.4,
                                height: baseSize * 0.8,
                                borderRadius: '60% 20% 80% 40%',
                                top: baseSize * 0.2,
                                left: baseSize * 0.1,
                                transform: 'rotate(-15deg)',
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                            variants={wingVariants}
                            animate={idleBehavior === 'walking' || animationState === 'celebrate' ? 'flap' : 'idle'}
                        />
                        <motion.div
                            className="absolute bg-gradient-to-bl from-orange-400 via-red-400 to-orange-600 border-2 border-red-600"
                            style={{
                                width: baseSize * 0.4,
                                height: baseSize * 0.8,
                                borderRadius: '20% 60% 40% 80%',
                                top: baseSize * 0.2,
                                right: baseSize * 0.1,
                                transform: 'rotate(15deg)',
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                            variants={wingVariants}
                            animate={idleBehavior === 'walking' || animationState === 'celebrate' ? 'flap' : 'idle'}
                        />

                        {/* Dragon Tail - More serpentine */}
                        <motion.div
                            className="absolute bg-gradient-to-r from-red-600 via-orange-500 to-red-500 border-2 border-red-700"
                            style={{
                                width: baseSize * 0.6,
                                height: baseSize * 0.25,
                                borderRadius: '50% 80% 50% 60%',
                                bottom: baseSize * 0.3,
                                left: -baseSize * 0.1,
                                transformOrigin: 'right center',
                                boxShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                            }}
                            variants={tailVariants}
                            animate="wag"
                        >
                            {/* Tail Spikes */}
                            <div
                                className="absolute bg-gradient-to-t from-gray-600 to-gray-400"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `${baseSize * 0.04}px solid transparent`,
                                    borderRight: `${baseSize * 0.04}px solid transparent`,
                                    borderBottom: `${baseSize * 0.15}px solid #6b7280`,
                                    top: -baseSize * 0.08,
                                    left: baseSize * 0.1
                                }}
                            />
                            <div
                                className="absolute bg-gradient-to-t from-gray-600 to-gray-400"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `${baseSize * 0.04}px solid transparent`,
                                    borderRight: `${baseSize * 0.04}px solid transparent`,
                                    borderBottom: `${baseSize * 0.12}px solid #6b7280`,
                                    top: -baseSize * 0.06,
                                    left: baseSize * 0.25
                                }}
                            />
                        </motion.div>
                    </motion.div>
                );

            case 'unicorn':
                return (
                    <motion.div
                        className="relative"
                        variants={spriteVariants}
                        animate="idle"
                    >
                        <motion.div
                            className="relative bg-gradient-to-r from-pink-200 to-purple-200 rounded-full"
                            style={{ width: baseSize, height: baseSize * 0.7 }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Unicorn Head */}
                            <motion.div
                                className="absolute bg-gradient-to-r from-pink-100 to-purple-100 rounded-full"
                                style={{
                                    width: baseSize * 0.5,
                                    height: baseSize * 0.5,
                                    top: -baseSize * 0.15,
                                    left: direction === 'right' ? baseSize * 0.4 : -baseSize * 0.1
                                }}
                            >
                                {/* Horn with sparkle effect */}
                                <motion.div
                                    className="absolute bg-gradient-to-t from-yellow-300 to-yellow-100"
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: `${baseSize * 0.05}px solid transparent`,
                                        borderRight: `${baseSize * 0.05}px solid transparent`,
                                        borderBottom: `${baseSize * 0.2}px solid #fbbf24`,
                                        top: -baseSize * 0.15,
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}
                                    animate={{
                                        filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)']
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />

                                {/* Eyes */}
                                <motion.div className="absolute top-2 left-1 w-2 h-2 bg-white rounded-full">
                                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 ml-0.5"></div>
                                </motion.div>
                                <motion.div className="absolute top-2 right-1 w-2 h-2 bg-white rounded-full">
                                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 ml-0.5"></div>
                                </motion.div>

                                {/* Face Expression */}
                                <motion.div
                                    className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs"
                                    key={getFacialExpression()}
                                >
                                    {getFacialExpression()}
                                </motion.div>
                            </motion.div>

                            {/* Mane */}
                            <motion.div
                                className="absolute bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-80"
                                style={{
                                    width: baseSize * 0.6,
                                    height: baseSize * 0.4,
                                    top: -baseSize * 0.05,
                                    left: direction === 'right' ? baseSize * 0.1 : baseSize * 0.3
                                }}
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                );

            case 'cat':
                return (
                    <motion.div
                        className="relative"
                        variants={spriteVariants}
                        animate="idle"
                    >
                        {/* Cat Body */}
                        <motion.div
                            className="relative bg-gradient-to-r from-orange-300 to-yellow-300 rounded-full"
                            style={{ width: baseSize, height: baseSize * 0.6 }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Cat Head */}
                            <motion.div
                                className="absolute bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"
                                style={{
                                    width: baseSize * 0.7,
                                    height: baseSize * 0.6,
                                    top: -baseSize * 0.25,
                                    left: direction === 'right' ? baseSize * 0.25 : -baseSize * 0.25
                                }}
                            >
                                {/* Cat Ears */}
                                <div
                                    className="absolute bg-orange-400"
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: `${baseSize * 0.08}px solid transparent`,
                                        borderRight: `${baseSize * 0.08}px solid transparent`,
                                        borderBottom: `${baseSize * 0.15}px solid #fb923c`,
                                        top: -baseSize * 0.1,
                                        left: baseSize * 0.15
                                    }}
                                ></div>
                                <div
                                    className="absolute bg-orange-400"
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderLeft: `${baseSize * 0.08}px solid transparent`,
                                        borderRight: `${baseSize * 0.08}px solid transparent`,
                                        borderBottom: `${baseSize * 0.15}px solid #fb923c`,
                                        top: -baseSize * 0.1,
                                        right: baseSize * 0.15
                                    }}
                                ></div>

                                {/* Eyes */}
                                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full">
                                    <div className="w-1 h-1 bg-green-600 rounded-full mt-0.5 ml-0.5"></div>
                                </div>
                                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full">
                                    <div className="w-1 h-1 bg-green-600 rounded-full mt-0.5 ml-0.5"></div>
                                </div>

                                {/* Nose */}
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full"></div>

                                {/* Face Expression */}
                                <motion.div
                                    className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs"
                                    key={getFacialExpression()}
                                >
                                    {getFacialExpression()}
                                </motion.div>
                            </motion.div>

                            {/* Cat Tail */}
                            <div
                                className={`absolute bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transform transition-transform duration-1000 ${idleBehavior === 'walking' ? 'rotate-12' : '-rotate-12'
                                    }`}
                                style={{
                                    width: baseSize * 0.15,
                                    height: baseSize * 0.8,
                                    bottom: baseSize * 0.1,
                                    left: direction === 'right' ? -baseSize * 0.1 : baseSize * 0.95,
                                    transformOrigin: 'bottom center'
                                }}
                            ></div>
                        </motion.div>
                    </motion.div>
                );

            case 'robot':
                return (
                    <motion.div
                        className="relative"
                        variants={spriteVariants}
                        animate="idle"
                    >
                        {/* Robot Body */}
                        <motion.div
                            className="relative bg-gradient-to-r from-gray-400 to-blue-400 rounded-lg"
                            style={{ width: baseSize, height: baseSize * 0.8 }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Robot Head */}
                            <motion.div
                                className="absolute bg-gradient-to-r from-gray-300 to-blue-300 rounded"
                                style={{
                                    width: baseSize * 0.6,
                                    height: baseSize * 0.5,
                                    top: -baseSize * 0.2,
                                    left: direction === 'right' ? baseSize * 0.3 : baseSize * 0.1
                                }}
                            >
                                {/* Antenna */}
                                <div
                                    className="absolute bg-gray-500 rounded-full"
                                    style={{
                                        width: baseSize * 0.03,
                                        height: baseSize * 0.15,
                                        top: -baseSize * 0.12,
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}
                                ></div>
                                <div
                                    className="absolute bg-red-400 rounded-full animate-pulse"
                                    style={{
                                        width: baseSize * 0.08,
                                        height: baseSize * 0.08,
                                        top: -baseSize * 0.15,
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}
                                ></div>

                                {/* Robot Eyes (LED style) */}
                                <div className="absolute top-1 left-1 w-3 h-1 bg-cyan-400 rounded animate-pulse"></div>
                                <div className="absolute top-1 right-1 w-3 h-1 bg-cyan-400 rounded animate-pulse"></div>

                                {/* Face Expression */}
                                <motion.div
                                    className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs"
                                    key={getFacialExpression()}
                                >
                                    {getFacialExpression()}
                                </motion.div>
                            </motion.div>

                            {/* Robot Arms */}
                            <div
                                className="absolute bg-gray-400 rounded"
                                style={{
                                    width: baseSize * 0.15,
                                    height: baseSize * 0.4,
                                    top: baseSize * 0.1,
                                    left: -baseSize * 0.1
                                }}
                            ></div>
                            <div
                                className="absolute bg-gray-400 rounded"
                                style={{
                                    width: baseSize * 0.15,
                                    height: baseSize * 0.4,
                                    top: baseSize * 0.1,
                                    right: -baseSize * 0.1
                                }}
                            ></div>

                            {/* Control Panel */}
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                            </div>
                        </motion.div>
                    </motion.div>
                );

            case 'ghost':
                return (
                    <motion.div
                        className="relative"
                        variants={spriteVariants}
                        animate="idle"
                    >
                        {/* Ghost Body */}
                        <motion.div
                            className="relative bg-gradient-to-r from-purple-200 to-blue-200 rounded-t-full opacity-80"
                            style={{ width: baseSize, height: baseSize * 0.9 }}
                            whileHover={{ scale: 1.1 }}
                        >
                            {/* Ghost wispy bottom */}
                            <div className="absolute bottom-0 left-0 w-full flex">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-gradient-to-b from-purple-200 to-transparent rounded-b-full animate-pulse"
                                        style={{
                                            width: `${baseSize / 5}px`,
                                            height: baseSize * 0.2,
                                            animationDelay: `${i * 0.2}s`
                                        }}
                                    ></div>
                                ))}
                            </div>

                            {/* Eyes */}
                            <div className="absolute top-4 left-2 w-3 h-3 bg-white rounded-full">
                                <div className="w-2 h-2 bg-black rounded-full mt-0.5 ml-0.5"></div>
                            </div>
                            <div className="absolute top-4 right-2 w-3 h-3 bg-white rounded-full">
                                <div className="w-2 h-2 bg-black rounded-full mt-0.5 ml-0.5"></div>
                            </div>

                            {/* Face Expression */}
                            <motion.div
                                className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs"
                                key={getFacialExpression()}
                            >
                                {getFacialExpression()}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                );

            default:
                // Fallback for other pet types - simple colored circle with face
                return (
                    <motion.div
                        className="relative"
                        variants={spriteVariants}
                        animate="idle"
                    >
                        <motion.div
                            className="relative bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
                            style={{ width: baseSize, height: baseSize }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full">
                                <div className="w-1 h-1 bg-black rounded-full mt-0.5 ml-0.5"></div>
                            </div>
                            <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full">
                                <div className="w-1 h-1 bg-black rounded-full mt-0.5 ml-0.5"></div>
                            </div>
                            <motion.div
                                className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs"
                                key={getFacialExpression()}
                            >
                                {getFacialExpression()}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="relative w-full h-40 bg-gradient-to-b from-sky-200 to-green-100 rounded-lg overflow-hidden border-2 border-gray-200">
            {/* Background elements */}
            <motion.div
                className="absolute bottom-0 left-0 w-full h-8 bg-green-200"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Sun */}
            <motion.div
                className="absolute top-2 right-4 w-6 h-6 bg-yellow-300 rounded-full"
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity }
                }}
            />

            {/* Clouds */}
            <motion.div
                className="absolute top-4 left-4 w-8 h-4 bg-white rounded-full opacity-70"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
                className="absolute top-6 left-16 w-6 h-3 bg-white rounded-full opacity-50"
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
            />

            {/* Pet positioned in the room */}
            <motion.div
                className="absolute"
                animate={{
                    left: `${position.x}%`,
                    bottom: `${100 - position.y}%`,
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut"
                }}
                style={{
                    transform: 'translateX(-50%)',
                }}
            >
                {/* Pet with state-based animations */}
                <motion.div
                    variants={containerVariants}
                    initial="idle"
                    animate={animationState}
                >
                    <PetSprite />
                </motion.div>

                {/* Activity indicators with animations */}
                <AnimatePresence>
                    {idleBehavior === 'sitting' && (
                        <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            💤
                        </motion.div>
                    )}

                    {animationState === 'eating' && (
                        <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: 1,
                                scale: [1, 1.3, 1],
                                y: [0, -5, 0]
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.5, repeat: 5 }}
                        >
                            🍖
                        </motion.div>
                    )}

                    {animationState === 'celebrate' && (
                        <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                scale: [0, 1.5, 1.5, 0],
                                rotate: [0, 180, 360]
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2 }}
                        >
                            ✨
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Pet status overlay */}
            <motion.div
                className="absolute bottom-1 left-2 text-xs text-gray-600 bg-white bg-opacity-70 px-2 py-1 rounded"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {pet.name} is {idleBehavior === 'standing' ? 'waiting' : idleBehavior}
                {animationState !== 'idle' && ` (${animationState})`}
            </motion.div>
        </div>
    );
};

export default PetAnimation; 