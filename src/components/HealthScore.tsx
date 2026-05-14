import React from 'react';
import { motion } from 'motion/react';

interface HealthScoreProps {
  score: number;
}

export function HealthScore({ score }: HealthScoreProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="rgba(0, 242, 255, 0.1)"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#00f2ff"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-mono font-bold text-cyan-400 cyan-text-glow"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-mono tracking-tighter text-cyan-200/60 uppercase">Vital Score</span>
      </div>
    </div>
  );
}
