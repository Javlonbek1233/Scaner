import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export function GlassPanel({ children, className, title, icon }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-panel rounded-[2rem] p-8 overflow-hidden relative group backdrop-blur-xl border-slate-800", className)}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && <div className="text-cyan-400 p-2 bg-cyan-500/10 rounded-lg">{icon}</div>}
            {title && <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h3>}
          </div>
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        </div>
      )}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </motion.div>
  );
}
