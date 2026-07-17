import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function DieFace({ value }) {
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-inner">
      {pips.map(([x, y], i) => (
        <span
          key={i}
          className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 bg-midnight-900 rounded-full"
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}
    </div>
  );
}

export default function DiceRenderer({ value, isRolling, onRollClick, disabled, label = 'Roll Dice' }) {
  const [displayValue, setDisplayValue] = useState(value || 1);

  useEffect(() => {
    if (isRolling) {
      let count = 0;
      const interval = setInterval(() => {
        setDisplayValue(1 + Math.floor(Math.random() * 6));
        count += 1;
        if (count > 8) clearInterval(interval);
      }, 60);
      return () => clearInterval(interval);
    }
    if (value) setDisplayValue(value);
    return undefined;
  }, [isRolling, value]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 1] } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DieFace value={displayValue} />
      </motion.div>
      <button
        onClick={onRollClick}
        disabled={disabled}
        className="px-4 py-2 rounded-xl bg-blush-500 hover:bg-blush-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-display font-semibold transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
