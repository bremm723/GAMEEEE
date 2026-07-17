import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DiceRenderer from '../components/DiceRenderer';
import TruthDareOverlay from '../components/TruthDareOverlay';
import ChatBox from '../components/ChatBox';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';
import { isMyTurn } from '../utils/gameLogic';

const LADDERS = { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98 };
const SNAKES = { 16: 6, 46: 25, 49: 11, 62: 19, 64: 60, 74: 53, 89: 68, 92: 88, 95: 75, 99: 80 };

export default function SnakesLadders() {
  const boardState = useGameStore((s) => s.boardState);
  const turn = useGameStore((s) => s.turn);
  const mySlot = useGameStore((s) => s.mySlot);
  const applyGameStateSync = useGameStore((s) => s.applyGameStateSync);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    function onSync({ boardState: bs, turn: t }) {
      applyGameStateSync({ boardState: bs, turn: t });
      setIsRolling(false);
    }
    socket.on('game_state_sync', onSync);
    return () => socket.off('game_state_sync', onSync);
  }, [applyGameStateSync]);

  function handleRoll() {
    if (!isMyTurn(turn, mySlot)) return;
    setIsRolling(true);
    socket.emit('roll_dice');
  }

  if (!boardState) return null;

  // Generate 100 tiles zig-zag (Boustrophedon)
  const tiles = [];
  for (let row = 9; row >= 0; row--) {
    for (let col = 0; col < 10; col++) {
      const tileNum = row % 2 === 0 ? (row * 10) + col + 1 : (row * 10) + 10 - col;
      tiles.push(tileNum);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <TruthDareOverlay />
      <ChatBox />

      <div className="w-full max-w-2xl flex items-center justify-between mb-6 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <h1 className="font-display font-bold text-2xl tracking-wide">🐍 Snakes & Ladders 🪜</h1>
        <div className={`text-sm px-4 py-2 rounded-full font-bold transition-colors ${isMyTurn(turn, mySlot) ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>
          {isMyTurn(turn, mySlot) ? 'Your Turn' : "Partner's Turn"}
        </div>
      </div>

      {/* BOARD UI */}
      <div className="grid grid-cols-10 grid-rows-10 w-full max-w-2xl aspect-square rounded-2xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 mb-8 bg-midnight-950">
        {tiles.map((tileNum, idx) => {
          const isLadder = LADDERS[tileNum];
          const isSnake = SNAKES[tileNum];
          const isAlternate = (Math.floor(idx / 10) + (idx % 10)) % 2 === 0;
          
          const p1Here = boardState.positions.P1 === tileNum;
          const p2Here = boardState.positions.P2 === tileNum;

          return (
            <div key={tileNum} className={`relative flex items-center justify-center border-[0.5px] border-white/5 ${isAlternate ? 'bg-white/5' : 'bg-transparent'}`}>
              <span className="absolute top-1 left-1 text-[8px] text-white/40 font-bold">{tileNum}</span>
              
              {isLadder && <span className="text-xl sm:text-2xl opacity-60">🪜</span>}
              {isSnake && <span className="text-xl sm:text-2xl opacity-60">🐍</span>}

              <div className="absolute inset-0 flex items-center justify-center gap-1">
                {p1Here && <motion.div layoutId="p1-snake" className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-xl z-20" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />}
                {p2Here && <motion.div layoutId="p2-snake" className="w-5 h-5 rounded-full bg-blush-500 border-2 border-white shadow-xl z-20" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />}
              </div>
            </div>
          );
        })}
      </div>

      <DiceRenderer value={boardState.lastRoll} isRolling={isRolling} onRollClick={handleRoll} disabled={!isMyTurn(turn, mySlot) || isRolling} />
    </div>
  );
}