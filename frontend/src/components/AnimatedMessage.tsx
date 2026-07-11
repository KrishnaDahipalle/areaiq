'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ role, content }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 24,
        mass: 0.8
      }}
      className={`flex flex-col ${role === 'user' ? 'items-end' : 'items-start'}`}
    >
      <span className="text-[10px] font-mono uppercase text-slate-500 mb-1 tracking-wider">
        {role === 'user' ? 'Client' : role === 'system' ? 'System Warning' : 'AreaIQ'}
      </span>
      <div className={`text-sm p-3 rounded-xl max-w-[90%] leading-relaxed shadow-md border transition-all whitespace-pre-wrap ${
        role === 'user' 
          ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-slate-900 border-teal-500/30 rounded-tr-none font-semibold shadow-teal-950/20' 
          : role === 'system'
          ? 'bg-rose-950/30 text-rose-300 border-rose-900/60 font-medium'
          : 'bg-slate-800/80 border-slate-700/50 text-slate-200 rounded-tl-none backdrop-blur-sm'
      }`}>
        {content
          .replace(/\*\s+/g, '• ')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
        }
      </div>
    </motion.div>
  );
};