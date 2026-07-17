import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import LandingPage from './pages/LandingPage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import SnakesLadders from './pages/SnakesLadders.jsx';
import MonopolyBoard from './pages/MonopolyBoard.jsx';
import LudoBoard from './pages/LudoBoard.jsx';
import ChessBoard from './pages/ChessBoard.jsx';
import { useGameStore } from './store/gameStore';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

function GameDispatcher() {
  const { roomId } = useParams();
  const selectedGame = useGameStore((s) => s.selectedGame);
  const storeRoomId = useGameStore((s) => s.roomId);

  if (!storeRoomId && !roomId) {
    return <Navigate to="/" replace />;
  }

  switch (selectedGame) {
    case 'snakesLadders':
      return <SnakesLadders />;
    case 'monopoly':
      return <MonopolyBoard />;
    case 'ludo':
      return <LudoBoard />;
    case 'chess':
      return <ChessBoard />;
    default:
      return <Navigate to={`/lobby/${roomId}`} replace />;
  }
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/lobby/:roomId"
          element={
            <PageTransition>
              <LobbyPage />
            </PageTransition>
          }
        />
        <Route
          path="/game/:roomId"
          element={
            <PageTransition>
              <GameDispatcher />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
