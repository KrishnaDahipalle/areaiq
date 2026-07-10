'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPanelProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedPanel: React.FC<AnimatedPanelProps> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.99 }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 20,
        mass: 1,
        delay: delay
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};