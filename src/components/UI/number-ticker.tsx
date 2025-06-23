"use client";

import React, { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
    value: number;
    direction?: "up" | "down";
    delay?: number;
    className?: string;
    decimalPlaces?: number;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
    value,
    direction = "up",
    delay = 0,
    className = "",
    decimalPlaces = 0,
}) => {
    const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = direction === "down" ? value : 0;
        const endValue = direction === "down" ? 0 : value;

        setDisplayValue(startValue);

        const timer = setTimeout(() => {
            const duration = 2000; // 2 seconds
            const steps = 60; // 60 FPS
            const increment = (endValue - startValue) / steps;
            let current = startValue;

            intervalRef.current = setInterval(() => {
                current += increment;

                if (
                    (direction === "up" && current >= endValue) ||
                    (direction === "down" && current <= endValue)
                ) {
                    setDisplayValue(endValue);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                } else {
                    setDisplayValue(current);
                }
            }, duration / steps);
        }, delay);

        return () => {
            clearTimeout(timer);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [value, direction, delay]);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }).format(num);
    };

    return (
        <span className={`font-mono tabular-nums ${className}`}>
            {formatNumber(displayValue)}
        </span>
    );
}; 