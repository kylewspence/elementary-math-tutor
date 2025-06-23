"use client";

import React from "react";

// Simple cn utility function
const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
};

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
    children,
    shimmerColor = "#ffffff",
    shimmerSize = "0.05em",
    borderRadius = "0.5rem",
    shimmerDuration = "3s",
    background = "radial-gradient(ellipse 80% 80% at 50% 120%, rgba(120, 119, 198, 0.3), transparent)",
    className,
    ...props
}) => {
    return (
        <button
            style={{
                "--spread": "90deg",
                "--shimmer-color": shimmerColor,
                "--radius": borderRadius,
                "--speed": shimmerDuration,
                "--cut": shimmerSize,
                "--bg": background,
            } as React.CSSProperties}
            className={cn(
                "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
                "transform-gpu transition-transform duration-300 ease-out active:scale-95",
                className,
            )}
            {...props}
        >
            {/* spark container */}
            <div
                className={cn(
                    "-z-30 blur-[2px]",
                    "absolute inset-0 overflow-visible [container-type:size]",
                )}
            >
                {/* spark */}
                <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
                    {/* spark before */}
                    <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
                </div>
            </div>

            {/* backdrop */}
            <div
                className={cn(
                    "-z-20",
                    "absolute inset-[var(--cut)] rounded-[calc(var(--radius)-var(--cut))] bg-slate-900/80 backdrop-blur-sm",
                )}
            />

            {/* content */}
            <div className="relative z-20">{children}</div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes slide {
          to {
            transform: translate(calc(100cqw - 100%), 0);
          }
        }
        @keyframes spin-around {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-slide {
          animation: slide var(--speed) ease-in-out infinite;
        }
        .animate-spin-around {
          animation: spin-around var(--speed) linear infinite;
        }
        `
            }} />
        </button>
    );
}; 