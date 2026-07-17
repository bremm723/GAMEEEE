import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TruthDareOverlay from '../components/TruthDareOverlay';
import ChatBox from '../components/ChatBox';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';
import { chessSquareColor, chessPieceSymbol } from '../utils/gameLogic';

export default function ChessBoard() {
  const navigate = useNavigate();
  const boardState = useGameStore((s) => s.boardState);
  const mySlot = useGameStore((s) => s.mySlot);
  const applyGameStateSync = useGameStore((s) => s.applyGameStateSync);
  const [selected, setSelected] = useState(null); // { row, col }
  const [invalidFlash, setInvalidFlash] = useState(null);
  const [winner, setWinner] = useState(null);

  const myColor = mySlot === 'P1' ? 'white' : 'black';

  useEffect(() => {
    function onSync({ boardState: bs }) {
      applyGameStateSync({ boardState: bs, turn: useGameStore.getState().turn });
      setSelected(null);
    }
    function onInvalid({ targetTile }) {
      setInvalidFlash(targetTile);
      setTimeout(() => setInvalidFlash(null), 400);
    }
    function onGameOver({ winner: w }) {
      setWinner(w);
    }
    socket.on('game_state_sync', onSync);
    socket.on('invalid_move', onInvalid);
    socket.on('game_over', onGameOver);
    return () => {
      socket.off('game_state_sync', onSync);
      socket.off('invalid_move', onInvalid);
      socket.off('game_over', onGameOver);
    };
  }, [applyGameStateSync]);

  if (!boardState) return null;

  const isMyTurnNow = boardState.turnColor === myColor;

  function handleSquareClick(row, col) {
    if (!isMyTurnNow) return;
    const piece = boardState.board[row][col];

    if (selected) {
      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }
      socket.emit('action_move', { from: selected, to: { row, col } });
      setSelected(null);
      return;
    }

    if (piece && piece.color === myColor) {
      setSelected({ row, col });
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8">
      <TruthDareOverlay />
      <ChatBox />

      <Modal isOpen={Boolean(winner)} closeOnBackdrop={false}>
        <div className="text-center space-y-4">
          <div className="text-4xl">🏆</div>
          <h3 className="text-xl font-display font-bold">
            {winner === mySlot ? 'Checkmate — You Win!' : 'Checkmate — Your Partner Wins!'}
          </h3>
          <Button onClick={() => navigate(`/lobby/${useGameStore.getState().roomId}`)}>Back to Lobby</Button>
        </div>
      </Modal>

      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-lg">♟️ Chess</h1>
        <div className={`text-sm px-3 py-1 rounded-full ${isMyTurnNow ? 'bg-blush-500' : 'bg-white/10'}`}>
          {isMyTurnNow ? 'Your Turn' : "Partner's Turn"}
        </div>
      </div>

      <div className="grid grid-cols-8 w-full max-w-md aspect-square rounded-xl overflow-hidden shadow-glow">
        {boardState.board.map((rowArr, row) =>
          rowArr.map((piece, col) => {
            const color = chessSquareColor(row, col);
            const isSelected = selected && selected.row === row && selected.col === col;
            const isInvalid = invalidFlash && invalidFlash.row === row && invalidFlash.col === col;

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => handleSquareClick(row, col)}
                className={`relative flex items-center justify-center text-2xl sm:text-3xl
                  ${color === 'light' ? 'bg-[#f0d9b5]' : 'bg-[#946f51]'}
                  ${isSelected ? 'ring-4 ring-blush-400 ring-inset' : ''}
                  ${isInvalid ? 'animate-pulse bg-red-500/60' : ''}
                `}
              >
                {piece && (
                  <motion.span layoutId={`chess-${row}-${col}`} initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                    {chessPieceSymbol(piece)}
                  </motion.span>
                )}
              </button>
            );
          })
        )}
      </div>

      <p className="text-xs text-white/40 mt-4">You are playing {myColor}. Capturing a piece draws a Truth or Dare card 💕</p>
    </div>
  );
}
