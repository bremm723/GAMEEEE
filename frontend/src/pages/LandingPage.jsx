import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import Toast from '../components/ui/Toast';
import socket, { connectSocket } from '../socket';
import { useGameStore } from '../store/gameStore';

export default function LandingPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10">
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="text-5xl mb-3">💌🎲</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blush-300 to-blush-500 bg-clip-text text-transparent">
          TUAN PUTRI X NDUT 
        </h1>
        <p className="text-white/60 mt-2 text-sm sm:text-base max-w-sm mx-auto">
          kita bersenang senang di sini oiii 
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4"
      >
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
      </motion.div>
    </div>
  );
}
