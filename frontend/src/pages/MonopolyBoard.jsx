import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DiceRenderer from '../components/DiceRenderer';
import TruthDareOverlay from '../components/TruthDareOverlay';
import ChatBox from '../components/ChatBox';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';
import { isMyTurn, formatCash } from '../utils/gameLogic';

const TILE_COLORS = {
  go: 'bg-emerald-500/20 border-emerald-500',
  jail: 'bg-orange-500/20 border-orange-500',
  freeParking: 'bg-sky-500/20 border-sky-500',
  goToJail: 'bg-red-500/20 border-red-500',
  truthdare: 'bg-blush-500/20 border-blush-500',
  tax: 'bg-zinc-500/20 border-zinc-500',
  railroad: 'bg-indigo-500/20 border-indigo-500',
  property: 'bg-white/5 border-white/10',
};

const TILE_ICONS = {
  go: '🏁', jail: '🚓', freeParking: '🅿️', goToJail: '🚨', truthdare: '💌', tax: '💸', railroad: '🚂', property: '🏠'
};

export default function MonopolyBoard() {
  const navigate = useNavigate();
  const boardState = useGameStore((s) => s.boardState);
  const turn = useGameStore((s) => s.turn);
  const mySlot = useGameStore((s) => s.mySlot);
  const applyGameStateSync = useGameStore((s) => s.applyGameStateSync);
  
  const [isRolling, setIsRolling] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [currentTile, setCurrentTile] = useState(null);

  useEffect(() => {
    function onSync({ boardState: bs, turn: t }) {
      applyGameStateSync({ boardState: bs, turn: t });
      setIsRolling(false);
      
      // Cek posisi setelah jalan
      const myPos = bs.positions[mySlot];
      const tile = bs.tiles.find(t => t.index === myPos);
      if (t === mySlot && tile?.type === 'property' && !tile.owner) {
        setCurrentTile(tile);
        setShowBuyModal(true);
      } else {
        setShowBuyModal(false);
      }
    }
    socket.on('game_state_sync', onSync);
    return () => socket.off('game_state_sync', onSync);
  }, [applyGameStateSync, mySlot]);

  function handleRoll() {
    if (!isMyTurn(turn, mySlot)) return;
    setIsRolling(true);
    socket.emit('roll_dice');
  }

  function handleBuyProperty() {
    socket.emit('buy_property');
    setShowBuyModal(false);
  }

  if (!boardState) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-6 overflow-hidden">
      <TruthDareOverlay />
      <ChatBox />

      {/* MODAL BELI TANAH */}
      <AnimatePresence>
        {showBuyModal && currentTile && (
          <Modal isOpen={true} closeOnBackdrop={false}>
            <div className="text-center space-y-4">
              <div className="text-5xl">🏠</div>
              <h3 className="text-xl font-display font-bold">Buy {currentTile.name}?</h3>
              <p className="text-sm text-white/70">Price: {formatCash(currentTile.price)}</p>
              <div className="flex gap-4 justify-center pt-4">
                <Button variant="ghost" onClick={() => setShowBuyModal(false)}>Skip</Button>
                <Button onClick={handleBuyProperty}>Buy Property</Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* HEADER INFO */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="flex flex-col">
          <span className="text-blue-400 font-bold">🔵 You (P1)</span>
          <span className="text-xl font-display tracking-wider">{formatCash(boardState.cash[mySlot])}</span>
        </div>
        <div className={`text-sm px-6 py-2 rounded-full font-bold shadow-lg transition-colors ${isMyTurn(turn, mySlot) ? 'bg-blush-500 text-white' : 'bg-white/10 text-white/50'}`}>
          {isMyTurn(turn, mySlot) ? 'Your Turn to Roll!' : "Waiting for Partner..."}
        </div>
        <div className="flex flex-col text-right">
          <span className="text-blush-400 font-bold">💗 Partner (P2)</span>
          <span className="text-xl font-display tracking-wider">{formatCash(boardState.cash[mySlot === 'P1' ? 'P2' : 'P1'])}</span>
        </div>
      </div>

      {/* BOARD GRID PIXEL-PERFECT */}
      <div className="relative w-full max-w-3xl aspect-square grid grid-cols-10 grid-rows-10 gap-1 bg-midnight-900/50 p-2 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5 mb-8">
        {boardState.tiles.map((tile) => {
          // Menentukan posisi grid keliling
          const perSide = 10;
          let r, c;
          if (tile.index < perSide) { r = 10; c = perSide - tile.index; }
          else if (tile.index < perSide * 2) { r = perSide * 2 - tile.index; c = 1; }
          else if (tile.index < perSide * 3) { r = 1; c = tile.index - perSide * 2 + 1; }
          else { r = tile.index - perSide * 3 + 1; c = 10; }

          const p1Here = boardState.positions.P1 === tile.index;
          const p2Here = boardState.positions.P2 === tile.index;

          return (
            <div key={tile.index} style={{ gridRow: r, gridColumn: c }}
              className={`relative flex flex-col items-center justify-center p-1 rounded-lg border-2 ${TILE_COLORS[tile.type]} shadow-inner overflow-hidden`}
            >
              {/* Ownership Indicator */}
              {tile.owner && (
                <div className={`absolute top-0 w-full h-1.5 ${tile.owner === 'P1' ? 'bg-blue-400' : 'bg-blush-400'}`} />
              )}
              
              <span className="text-xl sm:text-2xl mb-1">{TILE_ICONS[tile.type] || '✨'}</span>
              <span className="hidden sm:block text-[8px] leading-tight text-center font-semibold text-white/80">{tile.name}</span>
              
              {/* Player Tokens using Framer Motion */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                {p1Here && <motion.div layoutId="p1-mono" className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10" transition={{ type: "spring", bounce: 0.2 }}/>}
                {p2Here && <motion.div layoutId="p2-mono" className="w-4 h-4 rounded-full bg-blush-500 border-2 border-white shadow-lg z-10" transition={{ type: "spring", bounce: 0.2 }}/>}
              </div>
            </div>
          );
        })}
      </div>

      <DiceRenderer value={boardState.lastRoll} isRolling={isRolling} onRollClick={handleRoll} disabled={!isMyTurn(turn, mySlot) || isRolling} />
    </div>
  );
}