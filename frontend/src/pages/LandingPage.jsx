import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import Toast from '../components/ui/Toast';
import socket, { connectSocket } from '../socket';
import { useGameStore } from '../store/gameStore';

// --- KOMPONEN ANIMASI HATI MELAYANG ---
const FloatingHearts = () => {
  const hearts = Array.from({ length: 25 }); // Jumlah emoji
  const emojis = ['❤️', '💖', '✨', '💕', '🥰', '🧸'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((_, i) => {
        const randomX = Math.random() * 100; // Posisi horizontal acak
        const randomDelay = Math.random() * 5; // Delay muncul acak
        const randomDuration = 5 + Math.random() * 5; // Kecepatan melayang acak
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        return (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${randomX}vw`, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 1, 0.8, 0],
              scale: [0.5, 1.2, 1],
              rotate: [0, 20, -20, 0]
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute text-2xl sm:text-4xl"
          >
            {randomEmoji}
          </motion.div>
        );
      })}
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  
  // State untuk ngatur nampilin layar Anniversary atau Game Lobby
  const [showAnniversary, setShowAnniversary] = useState(true); 
  
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const setMySlot = useGameStore((s) => s.setMySlot);
  const applyRoomUpdate = useGameStore((s) => s.applyRoomUpdate);
  const setConnectionError = useGameStore((s) => s.setConnectionError);
  const toast = useGameStore((s) => s.toast);
  const setToast = useGameStore((s) => s.setToast);
  const setConnected = useGameStore((s) => s.setConnected);

  // --- EFEK KEMBANG API ---
  useEffect(() => {
    if (showAnniversary) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Kembang api dari sisi kiri
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        // Kembang api dari sisi kanan
        confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showAnniversary]);

  // --- LOGIKA SOCKET BAWAAN ---
  useEffect(() => {
    connectSocket();

    function onConnect() {
      setConnected(true);
    }
    function onRoomCreated({ roomId }) {
      setIsSubmitting(false);
      useGameStore.getState().setRoomId(roomId);
      setMySlot('P1');
      navigate(`/lobby/${roomId}`);
    }
    function onRoomJoined({ roomId }) {
      setIsSubmitting(false);
      useGameStore.getState().setRoomId(roomId);
      setMySlot('P2');
      navigate(`/lobby/${roomId}`);
    }
    function onRoomUpdate(room) {
      applyRoomUpdate(room);
    }
    function onRoomError({ message }) {
      setIsSubmitting(false);
      setToast(message);
      setConnectionError(message);
    }

    socket.on('connect', onConnect);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('room_update', onRoomUpdate);
    socket.on('room_error', onRoomError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('room_update', onRoomUpdate);
      socket.off('room_error', onRoomError);
    };
  }, [navigate, applyRoomUpdate, setMySlot, setConnectionError, setToast, setConnected]);

  function handleCreateRoom() {
    if (!name.trim()) {
      setToast('Enter your name first 💌');
      return;
    }
    setPlayerName(name.trim());
    setIsSubmitting(true);
    socket.emit('create_room', { playerName: name.trim() });
  }

  function handleJoinRoom() {
    if (!name.trim()) {
      setToast('Enter your name first 💌');
      return;
    }
    if (joinCode.trim().length !== 6) {
      setToast('Room codes are 6 characters');
      return;
    }
    setPlayerName(name.trim());
    setIsSubmitting(true);
    socket.emit('join_room', { roomId: joinCode.trim(), playerName: name.trim() });
  }

  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center px-6 py-10 overflow-hidden">
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <AnimatePresence mode="wait">
        {/* === HALAMAN ANNIVERSARY INTRO === */}
        {showAnniversary ? (
          <motion.div
            key="anniversary-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black px-4"
          >
            <FloatingHearts />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", bounce: 0.5 }}
              className="text-center z-10"
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                Happy Anniversary <br /> Bulan Ke-5
              </h1>
              
              <motion.h2 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-3xl sm:text-5xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              >
                TUAN PUTRI RATIHHH <br />
                <span className="text-pink-400">LOVE U MOREEE</span> 🥺💖
              </motion.h2>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(244,63,94,0.8)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAnniversary(false)}
                className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-full text-lg sm:text-xl shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all"
              >
                Lanjut Main Game 🎮
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          /* === HALAMAN LOBBY GAME (Muncul setelah diklik) === */
          <motion.div
            key="lobby-screen"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full flex flex-col items-center z-10"
          >
            <div className="text-center mb-10">
              <div className="text-5xl mb-3">💌🎲</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-pink-300 to-rose-500 bg-clip-text text-transparent">
                TUAN PUTRI X NDUT 
              </h1>
              <p className="text-white/60 mt-2 text-sm sm:text-base max-w-sm mx-auto">
                kita bersenang senang di sini oiii 
              </p>
            </div>

            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <TextInput
                value={name}
                onChange={setName}
                placeholder="Your name"
                maxLength={20}
              />

              {mode === 'join' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <TextInput
                    value={joinCode}
                    onChange={setJoinCode}
                    placeholder="ROOM CODE"
                    maxLength={6}
                    uppercase
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                </motion.div>
              )}

              {mode === null && (
                <div className="flex flex-col gap-3">
                  <Button fullWidth onClick={() => setMode('create')}>
                    Create Room
                  </Button>
                  <Button fullWidth variant="secondary" onClick={() => setMode('join')}>
                    Join Room
                  </Button>
                </div>
              )}

              {mode === 'create' && (
                <div className="flex flex-col gap-3">
                  <Button fullWidth onClick={handleCreateRoom} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Confirm & Create'}
                  </Button>
                  <Button fullWidth variant="ghost" onClick={() => setMode(null)}>
                    Back
                  </Button>
                </div>
              )}

              {mode === 'join' && (
                <div className="flex flex-col gap-3">
                  <Button fullWidth onClick={handleJoinRoom} disabled={isSubmitting}>
                    {isSubmitting ? 'Joining...' : 'Confirm & Join'}
                  </Button>
                  <Button fullWidth variant="ghost" onClick={() => setMode(null)}>
                    Back
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}