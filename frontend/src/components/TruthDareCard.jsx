import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';

export default function TruthDareCard({ card, isDrawer, onChooseType, onDone }) {
  const [flipped, setFlipped] = useState(false);

  const needsTypeChoice = isDrawer && !card;

  function handleChoose(type) {
    onChooseType(type);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-xl font-display font-bold text-blush-300">
        {needsTypeChoice ? 'Pick your fate 💕' : 'Truth or Dare!'}
      </h3>

      {needsTypeChoice ? (
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => handleChoose('truth')}>
            💬 Truth
          </Button>
          <Button variant="primary" onClick={() => handleChoose('dare')}>
            🔥 Dare
          </Button>
        </div>
      ) : (
        <div
          className="relative w-64 h-40 cursor-pointer"
          style={{ perspective: 1000 }}
          onClick={() => setFlipped(true)}
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Card back */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-blush-500 to-blush-700 flex items-center justify-center text-4xl font-display font-extrabold shadow-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {card?.type === 'dare' ? '🔥 DARE' : '💬 TRUTH'}
            </div>
            {/* Card front */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl bg-midnight-800 border-2 border-blush-400 flex items-center justify-center text-center px-5 text-sm sm:text-base font-medium"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {card?.text}
            </div>
          </motion.div>
        </div>
      )}

      {!needsTypeChoice && !flipped && (
        <p className="text-white/50 text-xs">Tap the card to reveal</p>
      )}

      {!needsTypeChoice && flipped && (
        <Button variant="primary" onClick={onDone}>
          Done / Verified ✔
        </Button>
      )}
    </div>
  );
}
