"use client";

import React, { useEffect, useState } from "react";

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
    const [particles, setParticles] = useState<Array<{
        id: number;
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
        size: number;
    }>>([]);

    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd"];

    useEffect(() => {
        if (!trigger) return;

        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
        }));

        setParticles(newParticles);

        const animationFrame = setInterval(() => {
            setParticles(prev =>
                prev.map(particle => ({
                    ...particle,
                    x: particle.x + particle.vx,
                    y: particle.y + particle.vy,
                    vy: particle.vy + 0.1, // gravity
                })).filter(particle => particle.y < window.innerHeight + 10)
            );
        }, 16);

        const cleanup = setTimeout(() => {
            setParticles([]);
            onComplete?.();
        }, 3000);

        return () => {
            clearInterval(animationFrame);
            clearTimeout(cleanup);
        };
    }, [trigger, onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.x * 0.1}deg)`,
                    }}
                />
            ))}
        </div>
    );
}; 