import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DiceRenderer from '../components/DiceRenderer';
import TruthDareOverlay from '../components/TruthDareOverlay';
import ChatBox from '../components/ChatBox';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';
import { isMyTurn, ludoTokenLabel } from '../utils/gameLogic';

const TOKEN_COLORS = { P1: 'bg-blue-400', P2: 'bg-blush-400' };

export default function LudoBoard() {
  const navigate = useNavigate();
  const boardState = useGameStore((s) => s.boardState);
  const turn = useGameStore((s) => s.turn);
  const mySlot = useGameStore((s) => s.mySlot);
  const applyGameStateSync = useGameStore((s) => s.applyGameStateSync);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    function onSync({ boardState: bs, turn: t }) {
      applyGameStateSync({ boardState: bs, turn: t });
      setIsRolling(false);
      if (t !== turn) setHasRolled(false);
    }
    function onDiceRolled() {
      setHasRolled(true);
    }
    function onGameOver({ winner: w }) {
      setWinner(w);
    }
    socket.on('game_state_sync', onSync);
    socket.on('dice_rolled', onDiceRolled);
    socket.on('game_over', onGameOver);
    return () => {
      socket.off('game_state_sync', onSync);
      socket.off('dice_rolled', onDiceRolled);
      socket.off('game_over', onGameOver);
    };
  }, [applyGameStateSync, turn]);

  function handleRoll() {
    if (!isMyTurn(turn, mySlot) || hasRolled) return;
    setIsRolling(true);
    socket.emit('roll_dice');
  }

  function handleTokenClick(tokenIndex) {
    if (!isMyTurn(turn, mySlot) || !hasRolled) return;
    socket.emit('action_move', { tokenIndex });
    setHasRolled(false);
  }

  if (!boardState) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8">
      <TruthDareOverlay />
      <ChatBox />

      <Modal isOpen={Boolean(winner)} closeOnBackdrop={false}>
        <div className="text-center space-y-4">
          <div className="text-4xl">🏆</div>
          <h3 className="text-xl font-display font-bold">
            {winner === mySlot ? 'You Win!' : 'Your Partner Wins!'}
          </h3>
          <Button onClick={() => navigate(`/lobby/${useGameStore.getState().roomId}`)}>Back to Lobby</Button>
        </div>
      </Modal>

      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-lg">🎲 Ludo</h1>
        <div className={`text-sm px-3 py-1 rounded-full ${isMyTurn(turn, mySlot) ? 'bg-blush-500' : 'bg-white/10'}`}>
          {isMyTurn(turn, mySlot) ? 'Your Turn' : "Partner's Turn"}
        </div>
      </div>

      <div className="w-full max-w-lg space-y-6 mb-8">
        {['P1', 'P2'].map((slot) => (
          <div key={slot} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs mb-3 font-semibold text-white/60">
              {slot === mySlot ? 'Your Tokens' : "Partner's Tokens"}
            </p>
            <div className="flex gap-3 flex-wrap">
              {boardState.tokens[slot].map((token, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => slot === mySlot && handleTokenClick(idx)}
                  disabled={slot !== mySlot}
                  className={`w-14 h-14 rounded-full ${TOKEN_COLORS[slot]} border-2 border-white/40 flex items-center justify-center text-[10px] font-bold text-midnight-900 disabled:opacity-70 ${
                    slot === mySlot && hasRolled ? 'ring-4 ring-blush-300 cursor-pointer' : ''
                  }`}
                >
                  {ludoTokenLabel(token, idx)}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <DiceRenderer
        value={boardState.lastRoll}
        isRolling={isRolling}
        onRollClick={handleRoll}
        disabled={!isMyTurn(turn, mySlot) || isRolling || hasRolled}
      />
      {hasRolled && (
        <p className="text-xs text-white/50 mt-3">Tap a token above to move it {boardState.lastRoll} steps</p>
      )}
    </div>
  );
}
