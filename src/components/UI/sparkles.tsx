"use client";

import React, { useEffect, useState } from "react";

interface SparklesProps {
    children: React.ReactNode;
    className?: string;
    color?: string;
    minSize?: number;
    maxSize?: number;
    density?: number;
}

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
}

export const Sparkles: React.FC<SparklesProps> = ({
    children,
    className = "",
    color = "#FFC700",
    minSize = 10,
    maxSize = 20,
    density = 8,
}) => {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        const generateSparkles = () => {
            const newSparkles: Sparkle[] = Array.from({ length: density }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * (maxSize - minSize) + minSize,
                delay: Math.random() * 2,
                duration: Math.random() * 1 + 0.5,
            }));
            setSparkles(newSparkles);
        };

        generateSparkles();
        const interval = setInterval(generateSparkles, 3000);

        return () => clearInterval(interval);
    }, [density, maxSize, minSize]);

    return (
        <div className={`relative inline-block ${className}`}>
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: sparkle.size,
                        height: sparkle.size,
                        animationDelay: `${sparkle.delay}s`,
                        animationDuration: `${sparkle.duration}s`,
                    }}
                >
                    <svg
                        viewBox="0 0 160 160"
                        className="animate-pulse"
                        style={{ color }}
                    >
                        <path
                            d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
            ))}
            {children}
        </div>
    );
}; 