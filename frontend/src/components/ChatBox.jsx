import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../socket';
import { useGameStore } from '../store/gameStore';

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);
  const mySlot = useGameStore((s) => s.mySlot);
  const playerName = useGameStore((s) => s.playerName);

  useEffect(() => {
    function handleIncoming(payload) {
      setMessages((prev) => [...prev, payload]);
    }
    socket.on('chat_message', handleIncoming);
    return () => socket.off('chat_message', handleIncoming);
  }, []);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const payload = { slot: mySlot, playerName, text: trimmed, at: Date.now() };
    socket.emit('chat_message', payload);
    setMessages((prev) => [...prev, payload]);
    setDraft('');
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 320 }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="w-72 mb-3 bg-midnight-800 border border-white/15 rounded-2xl overflow-hidden flex flex-col shadow-glow"
          >
            <div className="px-4 py-2 bg-white/5 text-sm font-display font-semibold">Chat</div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 no-scrollbar">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                    m.slot === mySlot ? 'ml-auto bg-blush-500 text-white' : 'bg-white/10 text-white/90'
                  }`}
                >
                  <div className="opacity-60 text-[10px] mb-0.5">{m.playerName || m.slot}</div>
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 p-2 border-t border-white/10">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Say something sweet..."
                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 bg-blush-500 hover:bg-blush-600 rounded-lg text-xs font-semibold"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-blush-500 hover:bg-blush-600 shadow-glow flex items-center justify-center text-2xl"
        aria-label="Toggle chat"
      >
        💬
      </button>
    </div>
  );
}
