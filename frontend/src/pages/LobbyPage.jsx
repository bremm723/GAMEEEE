import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';

const GAME_OPTIONS = [
  { key: 'snakesLadders', label: 'Snakes & Ladders', emoji: '🐍🪜' },
  { key: 'monopoly', label: 'Monopoly', emoji: '🏠' },
  { key: 'ludo', label: 'Ludo', emoji: '🎲' },
  { key: 'chess', label: 'Chess', emoji: '♟️' },
];

export default function LobbyPage() {
  const { roomId: routeRoomId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const roomId = useGameStore((s) => s.roomId) || routeRoomId;
  const players = useGameStore((s) => s.players);
  const status = useGameStore((s) => s.status);
  const mySlot = useGameStore((s) => s.mySlot);
  const applyRoomUpdate = useGameStore((s) => s.applyRoomUpdate);
  const setSelectedGame = useGameStore((s) => s.setSelectedGame);
  const toast = useGameStore((s) => s.toast);
  const setToast = useGameStore((s) => s.setToast);
  const applyGameStateSync = useGameStore((s) => s.applyGameStateSync);

  const isFull = players.length === 2;

  useEffect(() => {
    function onRoomUpdate(room) {
      applyRoomUpdate(room);
    }
    function onGameSelected({ gameKey }) {
      setSelectedGame(gameKey);
    }
function onGameStateSync(data) {
      // 1. Tangkap dan simpan tipe gamenya
      if (data && data.game) {
          setSelectedGame(data.game);
      }
      
      // 2. Tangkap dan simpan data PAPANNYA sebelum pindah halaman!
      if (data && data.boardState) {
          applyGameStateSync({ boardState: data.boardState, turn: data.turn });
      }

      // 3. Pindah halaman dengan jeda
      setTimeout(() => {
          navigate(`/game/${roomId}`);
      }, 50); 
    }

    socket.on('room_update', onRoomUpdate);
    socket.on('game_selected', onGameSelected);
    socket.on('game_state_sync', onGameStateSync);

    return () => {
      socket.off('room_update', onRoomUpdate);
      socket.off('game_selected', onGameSelected);
      socket.off('game_state_sync', onGameStateSync);
    };
  }, [applyRoomUpdate, setSelectedGame, navigate, roomId]);

function handleCopyCode() {
    const code = roomId || '';
    
    // Cek apakah browser support clipboard modern DAN koneksinya aman (HTTPS/localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code);
    } else {
      // Fallback (Cara alternatif) buat koneksi HTTP / IP LAN
      const textArea = document.createElement("textarea");
      textArea.value = code;
      
      // Sembunyiin text areanya biar kaga ngerusak UI
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      
      document.body.prepend(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
      } catch (error) {
        console.error('Gagal copy wok:', error);
      } finally {
        textArea.remove(); // Bersihin lagi abis dicopy
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSelectGame(gameKey) {
    if (!isFull) {
      setToast('Waiting for your partner to join...');
      return;
    }
    socket.emit('select_game', { gameKey });
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-6 py-10">
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-white/50 text-sm mb-1">Room Code</p>
        <button
          onClick={handleCopyCode}
          className="text-3xl sm:text-4xl font-display font-extrabold tracking-[0.3em] text-blush-300 hover:text-blush-200 transition-colors"
        >
          {roomId}
        </button>
        <p className="text-xs text-white/40 mt-1">{copied ? 'Copied! Share it with your partner 💌' : 'Tap code to copy'}</p>
      </motion.div>

      <div className="flex items-center gap-6 mb-10">
        {['P1', 'P2'].map((slot) => {
          const player = players.find((p) => p.slot === slot);
          return (
            <motion.div
              key={slot}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border ${
                player ? 'border-blush-400 bg-blush-500/10' : 'border-dashed border-white/20 bg-white/5'
              }`}
            >
              <div className="text-3xl">{player ? '💗' : '⏳'}</div>
              <div className="text-sm font-semibold">
                {player ? player.playerName : 'Waiting...'}
              </div>
              <div className="text-[10px] text-white/40">{slot === mySlot ? 'You' : slot}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-center text-white/70 text-sm mb-4 font-display font-semibold uppercase tracking-wider">
          {isFull ? 'Choose a game together' : 'Waiting for Player 2'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {GAME_OPTIONS.map((game, i) => (
              <motion.div
                key={game.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  onClick={() => handleSelectGame(game.key)}
                  disabled={!isFull}
                  className="w-full aspect-square rounded-2xl bg-white/5 hover:bg-blush-500/20 border border-white/10 hover:border-blush-400 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 transition-all"
                >
                  <span className="text-3xl">{game.emoji}</span>
                  <span className="text-xs font-semibold text-center px-2">{game.label}</span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Button variant="ghost" className="mt-10" onClick={() => navigate('/')}>
        ← Leave Room
      </Button>
    </div>
  );
}
