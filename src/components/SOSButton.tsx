"use client";

import { useState, useEffect, useRef } from "react";

interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function SOSButton({ onPress, disabled }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const reqRef = useRef<number | null>(null);

  const DURATION = 3000;

  useEffect(() => {
    if (isPressed && !disabled) {
      startTimeRef.current = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - (startTimeRef.current || now);
        const p = Math.min((elapsed / DURATION) * 100, 100);

        setProgress(p);

        if (p < 100) {
          reqRef.current = requestAnimationFrame(animate);
        } else {
          onPress();
          setIsPressed(false);
          setProgress(0);
        }
      };

      reqRef.current = requestAnimationFrame(animate);
    } else {
      if (reqRef.current) {
        cancelAnimationFrame(reqRef.current);
      }
      setProgress(0);
    }

    return () => {
      if (reqRef.current) {
        cancelAnimationFrame(reqRef.current);
      }
    };
  }, [isPressed, disabled, onPress]);

  const startPress = () => setIsPressed(true);
  const endPress = () => setIsPressed(false);

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      {!isPressed && !disabled && (
        <>
          <div className="absolute inset-[-20px] z-0 animate-ping rounded-full bg-rose-500/10" />
          <div className="absolute inset-[-10px] z-0 rounded-full bg-rose-500/5 animate-pulse" />
        </>
      )}

      <button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={(e) => { e.preventDefault(); startPress(); }}
        onTouchEnd={endPress}
        disabled={disabled}
        className={`relative z-10 flex h-64 w-64 items-center justify-center rounded-full text-white font-bold text-4xl tracking-widest transition-all select-none focus:outline-none touch-none ${
          isPressed
            ? "bg-gradient-to-br from-rose-700 to-red-800 scale-95"
            : disabled
              ? "bg-zinc-700 cursor-not-allowed"
              : "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 cursor-pointer shadow-[0_0_80px_rgba(239,68,68,0.35)]"
        }`}
      >
        <span className="relative z-20 drop-shadow-lg">SOS</span>

        {isPressed && (
          <span className="absolute -bottom-12 text-sm font-medium text-rose-400 animate-pulse">
            长按 3 秒触发 ({Math.ceil((DURATION - (progress/100)*DURATION)/1000)}s)
          </span>
        )}
      </button>

      {/* Progress Ring SVG */}
      {isPressed && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          width="280"
          height="280"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeOpacity="0.15"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75 ease-linear"
            transform="rotate(-90 100 100)"
          />
        </svg>
      )}
    </div>
  );
}
