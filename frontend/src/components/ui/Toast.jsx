import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message, onDismiss, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onDismiss && onDismiss(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-6 left-1/2 z-[60] bg-midnight-800 border border-blush-500/50 text-white px-5 py-3 rounded-2xl shadow-glow text-sm"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
